package utils

import (
	"errors"
	"path/filepath"
	"strings"
)

func IsImageMime(mime string) bool {
	switch mime {
	case "image/jpeg", "image/png", "image/webp":
		return true
	default:
		return false
	}
}

func IsImage(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp":
		return true
	default:
		return false
	}
}

func ValidateImage(filename, mime string, size int64) error {
	if !IsImage(filename) {
		return errors.New("invalid image extension")
	}
	if !IsImageMime(mime) {
		return errors.New("invalid image mime type")
	}
	if size > 2*1024*1024 {
		return errors.New("image size exceeds 2MB")
	}
	return nil
}
