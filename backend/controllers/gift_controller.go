package controllers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/RafaoCarvalh0/new-house-tea/backend/models"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type GiftController struct {
	Redis *redis.Client
}

func NewGiftController(redis *redis.Client) *GiftController {
	return &GiftController{Redis: redis}
}

// ListGifts returns all gifts
func (gc *GiftController) ListGifts(c *gin.Context) {
	ctx := context.Background()

	// Get all gift keys
	keys, err := gc.Redis.Keys(ctx, "gift:*").Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching gifts"})
		return
	}

	var gifts []models.Gift
	for _, key := range keys {
		giftJSON, err := gc.Redis.Get(ctx, key).Result()
		if err != nil {
			continue
		}

		var gift models.Gift
		if err := json.Unmarshal([]byte(giftJSON), &gift); err != nil {
			continue
		}

		gifts = append(gifts, gift)

	}

	c.JSON(http.StatusOK, gifts)
}

// ReserveGift marks a gift as reserved
func (gc *GiftController) ReserveGift(c *gin.Context) {
	ctx := context.Background()
	id := c.Param("id")

	// Get gift from Redis
	giftJSON, err := gc.Redis.Get(ctx, "gift:"+id).Result()
	if err == redis.Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gift not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching gift"})
		return
	}

	var gift models.Gift
	if err := json.Unmarshal([]byte(giftJSON), &gift); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing gift data"})
		return
	}

	if gift.Reserved {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gift already reserved"})
		return
	}

	gift.Reserved = true

	// Save updated gift back to Redis
	updatedJSON, err := json.Marshal(gift)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating gift"})
		return
	}

	if err := gc.Redis.Set(ctx, "gift:"+id, updatedJSON, 0).Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving gift"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Gift reserved successfully!"})
}

// UnreserveGift removes a gift reservation if the correct admin passkey is provided
func (gc *GiftController) UnreserveGift(c *gin.Context) {
	ctx := context.Background()
	id := c.Param("id")
	passkey := c.Query("passkey") // pode ser enviado como query param ?passkey=1234

	// Verifica se a passkey foi informada
	if passkey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing passkey"})
		return
	}

	// Busca a admKey no Redis
	storedKey, err := gc.Redis.Get(ctx, "giftadm:key").Result()
	if err == redis.Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin key not set"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching admin key"})
		return
	}

	// Valida a passkey
	if passkey != storedKey {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid passkey"})
		return
	}

	// Busca o gift
	giftJSON, err := gc.Redis.Get(ctx, "gift:"+id).Result()
	if err == redis.Nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gift not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching gift"})
		return
	}

	var gift models.Gift
	if err := json.Unmarshal([]byte(giftJSON), &gift); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing gift data"})
		return
	}

	// Atualiza o campo Reserved
	gift.Reserved = false

	updatedJSON, err := json.Marshal(gift)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error serializing gift"})
		return
	}

	if err := gc.Redis.Set(ctx, "gift:"+id, updatedJSON, 0).Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving gift"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Gift reservation removed successfully!"})
}
