package main

import (
	"log"
	"os"

	"github.com/RafaoCarvalh0/new-house-tea/backend/controllers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func main() {
	// Get Redis URL from environment
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Fatal("REDIS_URL environment variable is required")
	}

	// Initialize Redis client
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatal("Failed to parse Redis URL:", err)
	}

	rdb := redis.NewClient(opt) // Initialize router
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"} // Allow all origins - adjust in production
	router.Use(cors.New(config))

	// Initialize controller
	giftController := controllers.NewGiftController(rdb)

	// Define routes
	router.GET("/gifts", giftController.ListGifts)
	router.POST("/gifts/:id/reserve", giftController.ReserveGift)
	router.POST("/gifts/:id/unreserve", giftController.UnreserveGift)

	// Start server
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
