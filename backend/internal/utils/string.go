package utils

import (
	"strings"
	"unicode"

	"golang.org/x/text/unicode/norm"
)

// remove Vietnamese accents
func removeDiacritics(s string) string {
	t := norm.NFD.String(s)
	result := make([]rune, 0, len(t))
	for _, r := range t {
		if unicode.Is(unicode.Mn, r) {
			continue
		}
		result = append(result, r)
	}
	return string(result)
}

// Nguyen Minh Quang -> nguyen_minh_quang
func SlugifyName(name string) string {
	name = strings.ToLower(name)
	name = removeDiacritics(name)
	name = strings.TrimSpace(name)
	name = strings.Join(strings.Fields(name), "_")
	return name
}
