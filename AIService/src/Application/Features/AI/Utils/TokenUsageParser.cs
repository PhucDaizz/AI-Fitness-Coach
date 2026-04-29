using Microsoft.SemanticKernel;
using System.Text.Json;

namespace AIService.Application.Features.AI.Utils
{
    public static class TokenUsageParser
    {
        public static (int Prompt, int Completion) Parse(StreamingChatMessageContent? chunk)
        { 
            if (chunk?.Metadata == null) return (0, 0);

            if (TryParseGoogleTokens(chunk.Metadata, out var google))
                return google;

            if (TryParseUsageObject(chunk.Metadata, out var usage))
                return usage;

            return (0, 0);
        }

        private static bool TryParseGoogleTokens(IReadOnlyDictionary<string, object?> metadata, out (int, int) result)
        {
            result = (0, 0);

            if (metadata.TryGetValue("PromptTokenCount", out var pt) && pt is int ptInt)
                result.Item1 = ptInt;
            if (metadata.TryGetValue("CandidatesTokenCount", out var ct) && ct is int ctInt)
                result.Item2 = ctInt;

            return result.Item1 > 0 || result.Item2 > 0;
        }

        private static bool TryParseUsageObject(IReadOnlyDictionary<string, object?> metadata, out (int, int) result)
        {
            result = (0, 0);

            if (!metadata.TryGetValue("Usage", out var usageObj) || usageObj == null)
                return false;

            if (usageObj is JsonElement json)
            {
                result.Item1 = GetJsonProperty(json, "InputTokenCount", "PromptTokens", "prompt_tokens");
                result.Item2 = GetJsonProperty(json, "OutputTokenCount", "CompletionTokens", "completion_tokens");
            }
            else
            {
                var type = usageObj.GetType();
                result.Item1 = GetPropertyValue(type, usageObj, "InputTokenCount", "PromptTokens", "InputTokens");
                result.Item2 = GetPropertyValue(type, usageObj, "OutputTokenCount", "CompletionTokens", "OutputTokens");
            }

            return true;
        }

        private static int GetJsonProperty(JsonElement json, params string[] names)
        {
            foreach (var name in names)
                if (json.TryGetProperty(name, out var prop))
                    return prop.GetInt32();
            return 0;
        }

        private static int GetPropertyValue(Type type, object obj, params string[] names)
        {
            foreach (var name in names)
            {
                var prop = type.GetProperty(name);
                if (prop != null)
                    return Convert.ToInt32(prop.GetValue(obj) ?? 0);
            }
            return 0;
        }
    }
}