namespace AIService.Domain.Entities
{
    public class ExerciseMuscle
    {
        public int ExerciseId { get; private set; }
        public int MuscleId { get; private set; }
        public MuscleGroup MuscleGroup { get; private set; }

        public bool IsPrimary { get; private set; }

        private ExerciseMuscle() { } 

        public ExerciseMuscle(int exerciseId, int muscleId, bool isPrimary)
        {
            ExerciseId = exerciseId;
            MuscleId = muscleId;
            IsPrimary = isPrimary;
        }

        public static ExerciseMuscle Create(int exerciseId, int muscleId, bool isPrimary)
        {
            return new ExerciseMuscle(exerciseId, muscleId, isPrimary);
        }

        public void Update(bool isPrimary)
        {
            IsPrimary = isPrimary;
        }
    }
}
