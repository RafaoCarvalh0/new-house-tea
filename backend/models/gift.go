package models

import (
	"gorm.io/gorm"
)

type Gift struct {
	gorm.Model
	Description  string `json:"description"`
	ImageURL     string `json:"image_url"`
	PurchaseURL  string `json:"purchase_url"`
	IsReserved   bool   `json:"is_reserved" gorm:"default:false"`
}