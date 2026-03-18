namespace FanPulseApi.DTO
{
    public class OwnerCheckRequest
    {
        public Guid FromRequest {  get; set; }
        public Guid FromToken { get; set; }
        public OwnerCheckRequest(Guid fromRequest,Guid fromToken) {
            FromRequest = fromRequest;
            FromToken = fromToken;
        }

    }
}
