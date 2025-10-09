package controllers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rafaelcarvalho/new-house-tea/cache"
	"github.com/rafaelcarvalho/new-house-tea/models"
	"gorm.io/gorm"
)

type GiftController struct {
	DB *gorm.DB
}

func NewGiftController(db *gorm.DB) *GiftController {
	return &GiftController{DB: db}
}

// ListGifts returns all unreserved gifts
func (gc *GiftController) ListGifts(c *gin.Context) {
	// Try to get from cache first
	if gifts, found := cache.GetGifts(); found {
		c.JSON(http.StatusOK, gifts)
		return
	}

	// If not in cache, get from database
	var gifts []models.Gift
	result := gc.DB.Where("is_reserved = ?", false).Find(&gifts)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching gifts"})
		return
	}

	// Save to cache
	if err := cache.SetGifts(gifts); err != nil {
		// Log error but don't fail the request
		log.Printf("Error saving to cache: %v", err)
	}

	c.JSON(http.StatusOK, gifts)
}

// ReserveGift marks a gift as reserved
func (gc *GiftController) ReserveGift(c *gin.Context) {
	id := c.Param("id")
	
	var gift models.Gift
	if err := gc.DB.First(&gift, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gift not found"})
		return
	}

	if gift.IsReserved {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gift already reserved"})
		return
	}

	gift.IsReserved = true
	if err := gc.DB.Save(&gift).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error reserving gift"})
		return
	}

	// Invalidate cache after successful reservation
	if err := cache.InvalidateGiftsCache(); err != nil {
		// Log error but don't fail the request
		log.Printf("Error invalidating cache: %v", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Gift reserved successfully"})
}