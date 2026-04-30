package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// 统一响应状态码
const (
	CodeSuccess       = 200  // 成功
	CodeCreated       = 201  // 创建成功
	CodeNoContent     = 204  // 无内容
	CodeBadRequest    = 400  // 请求参数错误
	CodeUnauthorized  = 401  // 未授权
	CodeForbidden     = 403  // 禁止访问
	CodeNotFound      = 404  // 资源不存在
	CodeServerError   = 500  // 服务器错误
)

// Response 统一响应结构
type Response struct {
	Success bool        `json:"success"`
	Code    int         `json:"code"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Code:    CodeSuccess,
		Data:    data,
		Message: "操作成功",
	})
}

// SuccessWithMessage 成功响应（自定义消息）
func SuccessWithMessage(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusOK, Response{
		Success: true,
		Code:    CodeSuccess,
		Data:    data,
		Message: message,
	})
}

// Created 创建成功响应
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Success: true,
		Code:    CodeCreated,
		Data:    data,
		Message: "创建成功",
	})
}

// NoContent 无内容响应
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// BadRequest 错误请求响应
func BadRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Success: false,
		Code:    CodeBadRequest,
		Error:   message,
		Message: message,
	})
}

// Unauthorized 未授权响应
func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, Response{
		Success: false,
		Code:    CodeUnauthorized,
		Error:   message,
		Message: message,
	})
}

// Forbidden 禁止访问响应
func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, Response{
		Success: false,
		Code:    CodeForbidden,
		Error:   message,
		Message: message,
	})
}

// NotFound 资源不存在响应
func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, Response{
		Success: false,
		Code:    CodeNotFound,
		Error:   message,
		Message: message,
	})
}

// ServerError 服务器错误响应
func ServerError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, Response{
		Success: false,
		Code:    CodeServerError,
		Error:   message,
		Message: message,
	})
}

// Custom 自定义响应
func Custom(c *gin.Context, httpStatus int, success bool, code int, data interface{}, message string, err interface{}) {
	c.JSON(httpStatus, Response{
		Success: success,
		Code:    code,
		Data:    data,
		Message: message,
		Error:   err,
	})
}
