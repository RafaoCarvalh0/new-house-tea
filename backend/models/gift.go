package models

type Gift struct {
	ID          string `json:"id"`
	Description string `json:"description"`
	Link        string `json:"link"`
	ImageUrl    string `json:"image_url"`
	Reserved    bool   `json:"reserved"`
}
