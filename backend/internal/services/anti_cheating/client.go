package anti_cheating

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

// AntiCheatingClient implements the AntiCheatingService interface
type AntiCheatingClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewAntiCheatingClient creates a new anti-cheating service client
func NewAntiCheatingClient(baseURL string) *AntiCheatingClient {
	return &AntiCheatingClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 60 * time.Second, // Tăng timeout vì xử lý ảnh có thể mất thời gian
		},
	}
}

// AddPersonToDatabase adds a new person to face recognition database
func (c *AntiCheatingClient) AddPersonToDatabase(candidateID int64, candidateName string, imageFile *multipart.FileHeader) (*AddPersonResponse, error) {
	// Mở file để đọc
	file, err := imageFile.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open image file: %w", err)
	}
	defer file.Close()

	// Tạo multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Thêm candidate_id
	if err := writer.WriteField("candidate_id", fmt.Sprintf("%d", candidateID)); err != nil {
		return nil, fmt.Errorf("failed to write candidate_id: %w", err)
	}

	// Thêm candidate_name
	if err := writer.WriteField("candidate_name", candidateName); err != nil {
		return nil, fmt.Errorf("failed to write candidate_name: %w", err)
	}

	// Thêm file
	part, err := writer.CreateFormFile("file", imageFile.Filename)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}
	if _, err := io.Copy(part, file); err != nil {
		return nil, fmt.Errorf("failed to copy file: %w", err)
	}

	writer.Close()

	// Tạo request
	url := fmt.Sprintf("%s/add_new_person", c.baseURL)
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Gửi request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Đọc response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Parse response
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned error status %d: %s", resp.StatusCode, string(respBody))
	}

	var result AddPersonResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &result, nil
}

// SyncAllUsersFromBackend syncs all users from profile_image_users to face database
func (c *AntiCheatingClient) SyncAllUsersFromBackend() (*SyncAllResponse, error) {
	url := fmt.Sprintf("%s/sync_all_users_from_backend", c.baseURL)

	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned error status %d: %s", resp.StatusCode, string(respBody))
	}

	var result SyncAllResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &result, nil
}

// DeletePerson deletes a person from face database
func (c *AntiCheatingClient) DeletePerson(candidateID int64) error {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	if err := writer.WriteField("candidate_id", fmt.Sprintf("%d", candidateID)); err != nil {
		return fmt.Errorf("failed to write candidate_id: %w", err)
	}
	writer.Close()

	url := fmt.Sprintf("%s/delete_person", c.baseURL)
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API returned error status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// VerifyUser verifies if the person in the image matches the candidate ID
func (c *AntiCheatingClient) VerifyUser(candidateID int64, imageFile *multipart.FileHeader) (*VerifyUserResponse, error) {
	file, err := imageFile.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open image file: %w", err)
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	if err := writer.WriteField("candidate_id", fmt.Sprintf("%d", candidateID)); err != nil {
		return nil, fmt.Errorf("failed to write candidate_id: %w", err)
	}

	part, err := writer.CreateFormFile("file", imageFile.Filename)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}
	if _, err := io.Copy(part, file); err != nil {
		return nil, fmt.Errorf("failed to copy file: %w", err)
	}

	writer.Close()

	url := fmt.Sprintf("%s/verify_user", c.baseURL)
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned error status %d: %s", resp.StatusCode, string(respBody))
	}

	var result VerifyUserResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &result, nil
}
