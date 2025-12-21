package utils

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

func SaveUserAvatar(userID int64, userName string, file *multipart.FileHeader) (string, error) {
	// Validate file
	fileReader, _ := file.Open()
	defer fileReader.Close()
	buf := make([]byte, 512)
	_, _ = fileReader.Read(buf)
	mimeType := http.DetectContentType(buf)

	if err := ValidateImage(file.Filename, mimeType, file.Size); err != nil {
		return "", err
	}

	// Folder user
	slugName := SlugifyName(userName)
	userFolder := fmt.Sprintf("%d_%s", userID, slugName)
	baseDir := "uploads/profile_image_users"
	uploadDir := filepath.Join(baseDir, userFolder)
	_ = os.MkdirAll(uploadDir, os.ModePerm)

	// Xóa tất cả ảnh cũ trong thư mục (ghi đè)
	files, err := os.ReadDir(uploadDir)
	if err == nil {
		for _, f := range files {
			if !f.IsDir() {
				oldFilePath := filepath.Join(uploadDir, f.Name())
				_ = os.Remove(oldFilePath)
			}
		}
	}

	// File name
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d_%s%s", userID, slugName, ext)
	filePath := filepath.Join(uploadDir, filename)

	// Save file bằng io.Copy
	dstFile, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer dstFile.Close()

	srcFile, err := file.Open()
	if err != nil {
		return "", err
	}
	defer srcFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	if err != nil {
		return "", fmt.Errorf("failed to save avatar: %w", err)
	}

	return filePath, nil
}
