using Application.Common.Interfaces;
using Application.DTOs.User;
using Application.Features.User.Commands.ChangePassword;
using Application.Features.User.Commands.ConfirmEmail;
using Application.Features.User.Commands.ExternalLogin;
using Application.Features.User.Commands.ForgotPassword;
using Application.Features.User.Commands.Login;
using Application.Features.User.Commands.RefreshToken;
using Application.Features.User.Commands.Register;
using Application.Features.User.Commands.ResetPasswordCommand;
using Application.Features.User.Commands.SendEmailConfim;
using Application.Features.User.Commands.UpdateInfor;
using Application.Features.User.Commands.UploadAvatar;
using Application.Features.User.Queries.GetInfoDetail;
using Application.Features.User.Queries.GetUsersWithPagination;
using Application.Features.User.Queries.IsUserExisting;
using Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService;
        private readonly IConfiguration _configuration;

        public AuthController(IMediator mediator, ICurrentUserService currentUserService, IConfiguration configuration)
        {
            _mediator = mediator;
            _currentUserService = currentUserService;
            _configuration = configuration;
        }

        /// <summary>
        /// Đăng ký người dùng thông thường
        /// </summary>
        /// <remarks>
        /// </remarks>
        [HttpPost]
        [Route("register-customer")]
        public async Task<IActionResult> Register([FromBody]RegisterCommand command, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(command, cancellationToken);

            if (result.IsSuccess)
            {
                var response = ApiResponse<string>.SuccessResponse(
                    result.Value,
                    "User created successfully."
                );

                return Ok(response);
            }

            return BadRequest(ApiResponse<string>.ErrorResponse(
                result.Error.Code,
                new List<string> { result.Error.Message }
            ));
        }

        /// <summary>
        /// Đăng nhập dành cho tất cả role
        /// </summary>
        /// <remarks>
        /// </remarks>
        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            var result = await _mediator.Send(command);
            if (result.IsSuccess)
            {
                return Ok(ApiResponse<LoginResponseDto>.SuccessResponse(result.Value, "Login Success"));
            }
            return Unauthorized(ApiResponse<LoginResponseDto>.ErrorResponse(result.Error.Message));
        }

        /// <summary>
        /// Refreshtoken cấp lại token mà không cần đăng nhập lại
        /// </summary>
        /// <remarks>
        /// </remarks>
        [Route("Refreshtoken")]
        [HttpPost]
        public async Task<IActionResult> RefreshToken(RefreshTokenCommand refreshTokenModel)
        {

            var result = await _mediator.Send(refreshTokenModel);
            if (result.IsFailure)
            {
                return Unauthorized(ApiResponse<LoginResponseDto>.ErrorResponse(result.Error.Message));
            }

            return Ok(ApiResponse<LoginResponseDto>.SuccessResponse(result.Value));
        }

        /// <summary>
        /// Xem thông tin của bản thân
        /// </summary>
        /// <remarks>
        /// </remarks>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetInfo()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<GetInfoDetailQuery>.ErrorResponse("User not authenticated"));
            }

            var result = await _mediator.Send(new GetInfoDetailQuery
            {
                UserId = userId
            });

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<InforDto>.SuccessResponse(result.Value));
            }
            return BadRequest(ApiResponse<InforDto>.ErrorResponse(
                result.Error.Code,
                new List<string> { result.Error.Message }
            ));
        }

        /// <summary>
        /// 1.1 Gửi email xác nhận tài khoản
        /// </summary>
        /// <remarks>
        /// Mục đích
        /// 1. có thể lấy lại tài khoản đã đăng ký nếu bị quên
        /// Thứ tự gọi 
        /// 1. Goi đến api này khi khách muốn nhận mã xác nhận email
        /// 2. Sau đấy khi khách ấn vào link đã gửi đến trong mail chuyên nó về link giao diện xác nhận thành công
        /// 3. Sau khi chuyển về giao diện FE gọi api 1.2 email-confirmation đê hệ thống đánh dấu đã xác nhận
        /// </remarks>
        [Authorize]
        [HttpPost]
        [Route("send-confirmemail")]
        public async Task<IActionResult> SendConfirmEmail()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var result = await _mediator.Send(
                new SendEmailConfimCommand
                {
                    UserId = userId
                });

            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(result.Error.Code, new List<string> { result.Error.Message }));
            }

            return Ok(ApiResponse<string>.SuccessResponse(result.Value.ToString()));
        }

        /// <summary>
        /// 1.2 Xác nhận email gưi đến chính chủ thành công 
        /// </summary>
        /// <remarks>
        /// </remarks>
        [HttpGet]
        [Route("email-confirmation")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("EMPTY.TOKEN", new List<string> { "User Id and Token are required" }));
            }

            var result = await _mediator.Send(new ConfirmEmailCommand
            {
                UserId = userId,
                Token = token
            });

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<string>.SuccessResponse(result.Value, "Email confirmed successfully."));
            }

            return BadRequest(ApiResponse<string>.ErrorResponse(
                result.Error.Code,
                new List<string> { result.Error.Message }
            ));
        }

        /// <summary>
        /// Bước 1: Gọi lên Google để xin quyền
        /// </summary>
        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties
            {
                // Bảo Google sau khi xong thì quay về hàm Callback bên dưới
                RedirectUri = Url.Action(nameof(GoogleSignInCallbackHandler))
            };

            return Challenge(properties, "Google");
        }

        /// <summary>
        /// Bước 2: Hứng data từ Google, tạo Token hệ thống và đá về Frontend
        /// </summary>
        [HttpGet("google-callback-handler")]
        public async Task<IActionResult> GoogleSignInCallbackHandler()
        {
            var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";

            try
            {
                var authenticateResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                if (!authenticateResult.Succeeded)
                {
                    return Redirect($"{frontendUrl}/login-failed?error=Google_Authentication_Failed");
                }

                var principal = authenticateResult.Principal;
                var email = principal.FindFirstValue(ClaimTypes.Email);

                if (string.IsNullOrEmpty(email))
                {
                    return Redirect($"{frontendUrl}/login-failed?error=Email_Not_Found");
                }

                var command = new ExternalLoginCommand
                {
                    Email = email,
                    Provider = "Google",
                    ProviderKey = principal.FindFirstValue(ClaimTypes.NameIdentifier),
                    FirstName = principal.FindFirstValue(ClaimTypes.GivenName),
                    LastName = principal.FindFirstValue(ClaimTypes.Surname),
                    AvatarUrl = principal.FindFirstValue("picture")
                };

                var result = await _mediator.Send(command);

                if (result.IsFailure)
                {
                    return Redirect($"{frontendUrl}/login-failed?error={Uri.EscapeDataString(result.Error.Message)}");
                }

                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                var loginData = result.Value;
                return Redirect($"{frontendUrl}/oauth-callback?" +
                    $"token={Uri.EscapeDataString(loginData.Token)}" +
                    $"&refreshToken={Uri.EscapeDataString(loginData.RefreshToken ?? "")}");
            }
            catch (Exception ex)
            {
                return Redirect($"{frontendUrl}/login-failed?error={Uri.EscapeDataString(ex.Message)}");
            }
        }

        /// <summary>
        /// Change user password (requires authentication)
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
        {
            var result = await _mediator.Send(command);

            if (result.IsFailure)
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = result.Error.Message,
                    Data = false
                });
            }

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Message = "Password changed successfully",
                Data = result.Value
            });
        }


        /// <summary>
        /// 1.3 Yêu cầu reset mật khẩu (yêu cầu đã xác nhận email trước đó)
        /// </summary>
        /// <remarks>
        /// ClientUrl là link gốc giao diện để đôi mặt khẩu ví dụ (https:localhost:1234/auth/resetpass)
        /// Trình tự dùng
        /// 1. Call api hiện tại trước để nhận tin qua mail để hệ thống tạo token tạm thời để đổi mật khẩu
        /// 2. Sau khi nhận link và chuyên về FE gọi api 1.4 resetpassword để đổi mật khẩu
        /// </remarks>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody]ForgotPasswordCommand request)
        {
            
            var result = await _mediator.Send(new ForgotPasswordCommand
            {
                Email = request.Email,
                ClientUrl = request.ClientUrl
            });

            if (result.IsSuccess)
            {
                return Ok(ApiResponse<string>.SuccessResponse(null,"A password reset link has been sent"));
            }

            return BadRequest(
                ApiResponse<string>.ErrorResponse(result.Error.Code, new List<string> { result.Error.Message }));
        }

        /// <summary>
        /// 1.4 Đổi mật khẩu đã quên
        /// </summary>
        /// <remarks>
        /// Lưu ý Token trong body lấy từ đường link api 1.3 forgot-password sinh ra đã gửi trong email
        /// Trình tự dùng
        /// 1. Call api 1.3 forgot-password trước để nhận tin qua mail để hệ thống tạo token tạm thời để đổi mật khẩu
        /// 2. Sau khi nhận link và chuyên về FE gọi api hiện tại để đổi mật khẩu
        /// </remarks>
        [HttpPost("resetpassword")]
        public async Task<IActionResult> ResetPassword([FromBody]ResetPasswordCommand command)
        {
            var result = await _mediator.Send(command);

            if (result.IsFailure)
            {
                return BadRequest(
                    ApiResponse<string>.ErrorResponse(
                        result.Error.Code,
                        new List<string> { result.Error.Message }
                    )
                );
            }

            return Ok(ApiResponse<string>.SuccessResponse(result.Value));
        }

        /// <summary>
        /// Cập nhật thông tin cá nhân
        /// </summary>
        /// <remarks>
        /// </remarks>
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateInfor([FromBody]UpdateInforCommand command)
        {
            
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<string>.ErrorResponse("User not found!"));
            }

            var result = await _mediator.Send(command);
            if (result.IsSuccess)
            {
                return Ok(ApiResponse<string>.SuccessResponse(result.Value, "User information updated successfully."));
            }
            return BadRequest(ApiResponse<string>.ErrorResponse(
                result.Error.Code,
                new List<string> { result.Error.Message }
            ));

        }

        /// <summary>
        /// Tải lên ảnh đại diện lưu ý dùng IFormFile
        /// </summary>
        /// <remarks>
        /// </remarks>
        [HttpPost("upload-avatar")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB
        [RequestFormLimits(MultipartBodyLengthLimit = 5 * 1024 * 1024)]
        public async Task<IActionResult> UploadAvatar(IFormFile file, [FromQuery] bool deleteOld = true)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (file == null || file.Length == 0)
                    return BadRequest("No file uploaded");

                var result = await _mediator.Send(new UploadAvatarCommand
                {
                    File = file,
                    UserId = userId,
                    DeleteOldAvatar = deleteOld,
                    OptimizeImage = true
                });

                return Ok(ApiResponse<UploadAvatarResult>.SuccessResponse(result.Value, "Avatar uploaded successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("UPLOAD_FAILED", new List<string> { ex.Message }));
            }
        }

        /// <summary>
        /// Admin xem thông tin người dùng
        /// </summary>
        /// <remarks>
        /// </remarks>
        [HttpGet("{userId}")]
        [Authorize(Roles = AppRoles.SysAdmin)]
        public async Task<IActionResult> GetUserInfo(string userId)
        {
            var result = await _mediator.Send(new GetInfoDetailQuery
            {
                UserId = userId
            });

            return result.IsSuccess
                ? Ok(ApiResponse<InforDto>.SuccessResponse(result.Value))
                : NotFound(ApiResponse<InforDto>.ErrorResponse(result.Error.Code));
        }

        /// <summary>
        /// Xem danh sách người dùng
        /// </summary>
        /// <remarks>
        /// - Admin xem được tất cả 
        /// - Chủ khách sạn chỉ xem nhân viên của khách sạn đó
        /// - Lễ tân chỉ xem nhân viên của khách sạn đó
        /// - Người dùng thông thường không được phép
        /// Trường Role có các role gồm "SysAdmin" "Customer"
        /// </remarks>
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetUsers([FromQuery] GetUsersWithPaginationQuery query)
        {
            var currentRole = User.FindFirstValue(ClaimTypes.Role);

            if (currentRole == AppRoles.SysAdmin)
            {
            }
            else
            {
                return Unauthorized();
            }

            var result = await _mediator.Send(query);

            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(result.Error.Message));
            }

            return Ok(ApiResponse<Domain.Common.Models.PagedResult<UserDto>>.SuccessResponse(result.Value));
        }

        /// <summary>
        /// Không map ra APIGateWay
        /// </summary>
        /// <remarks>
        /// </remarks>
        [HttpGet("user-existing")]
        public async Task<IActionResult> IsUsserExisting([FromQuery]Guid userId)
        {
            var request = new IsUserExistingQuery
            {
                UserId = userId
            };

            var result = await _mediator.Send(request);
            return Ok(ApiResponse<bool>.SuccessResponse(result.Value));
        }
    }
}
