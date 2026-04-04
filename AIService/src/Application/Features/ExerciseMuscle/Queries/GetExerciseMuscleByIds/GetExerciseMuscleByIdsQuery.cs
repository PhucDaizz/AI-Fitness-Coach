using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseMuscle.Queries.GetExerciseMuscleByIds
{
    public class GetExerciseMuscleByIdsQuery : IRequest<Result<Domain.Entities.ExerciseMuscle>>
    {
        public int ExerciseId { get; set; }
        public int MuscleId { get; set; }
        
        public GetExerciseMuscleByIdsQuery(int exerciseId, int muscleId)
        {
            ExerciseId = exerciseId;
            MuscleId = muscleId;
        }
    }
}
