import { useState } from 'react';
import { format, isToday } from 'date-fns';
import { useWorkoutsStore } from '../../stores/workoutsStore';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';

interface WorkoutFormProps {
  date: Date;
  onClose: () => void;
}

export default function WorkoutForm({ date, onClose }: WorkoutFormProps) {
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addWorkout } = useWorkoutsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isToday(date)) {
      toast.error('Workouts can only be added for the current day');
      return;
    }
    
    if (!name.trim() || !sportType.trim()) {
      toast.error('Workout name and sport type are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await addWorkout({
        name,
        sport_type: sportType,
        date: format(date, 'yyyy-MM-dd'),
        duration,
        notes: notes.trim() ? notes : undefined,
      });
      
      toast.success('Workout added successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add workout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="workout-name" className="form-label">
          Workout Name*
        </label>
        <input
          id="workout-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="E.g., Morning Run, Leg Day"
          required
        />
      </div>
      
      <div>
        <label htmlFor="workout-date" className="form-label">
          Date
        </label>
        <input
          id="workout-date"
          type="text"
          value={format(date, 'EEEE, MMMM d, yyyy')}
          className="input"
          disabled
        />
        {!isToday(date) && (
          <p className="text-red-500 text-sm mt-1">
            Workouts can only be added for today
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="sport-type" className="form-label">
          Sport Type*
        </label>
        <input
          id="sport-type"
          type="text"
          value={sportType}
          onChange={(e) => setSportType(e.target.value)}
          className="input"
          placeholder="E.g., Running, Weightlifting"
          required
        />
      </div>
      
      <div>
        <label htmlFor="duration" className="form-label">
          Duration (minutes)
        </label>
        <input
          id="duration"
          type="number"
          value={duration || ''}
          onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
          className="input"
          placeholder="Duration in minutes"
          min="1"
        />
      </div>
      
      <div>
        <label htmlFor="notes" className="form-label">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="textarea"
          placeholder="Any additional notes about your workout"
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-md"
          disabled={isLoading || !isToday(date)}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Dumbbell className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            'Add Workout'
          )}
        </button>
      </div>
    </form>
  );
}