package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/rafaelcarvalho/new-house-tea/models"
	"github.com/redis/go-redis/v9"
)

var (
	redisClient *redis.Client
	ctx         = context.Background()
)

const (
	GIFTS_KEY     = "gifts:all"
	CACHE_TIMEOUT = 1 * time.Hour
)

func InitRedis(addr string) error {
	if addr == "" {
		return nil // Redis is optional, no error if not configured
	}

	redisClient = redis.NewClient(&redis.Options{
		Addr: addr,
	})

	// Ping Redis to check connection
	if err := redisClient.Ping(ctx).Err(); err != nil {
		redisClient = nil // Reset client on error
		return err
	}

	return nil
}

// GetGifts attempts to get gifts from cache
func GetGifts() ([]models.Gift, bool) {
	if redisClient == nil {
		return nil, false
	}

	val, err := redisClient.Get(ctx, GIFTS_KEY).Result()
	if err != nil {
		return nil, false
	}

	var gifts []models.Gift
	if err := json.Unmarshal([]byte(val), &gifts); err != nil {
		return nil, false
	}

	return gifts, true
}

// SetGifts saves gifts to cache
func SetGifts(gifts []models.Gift) error {
	if redisClient == nil {
		return nil // Silently skip if Redis is not configured
	}

	data, err := json.Marshal(gifts)
	if err != nil {
		return err
	}

	return redisClient.Set(ctx, GIFTS_KEY, data, CACHE_TIMEOUT).Err()
}

// InvalidateGiftsCache removes gifts from cache
func InvalidateGiftsCache() error {
	if redisClient == nil {
		return nil // Silently skip if Redis is not configured
	}
	return redisClient.Del(ctx, GIFTS_KEY).Err()
}