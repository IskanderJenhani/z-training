import { useState, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import { useWorkoutsStore } from '../../stores/workoutsStore';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';
import { Workout } from '../../types/workout';

interface WorkoutFormProps {
  date: Date;
  existingWorkout?: Workout | null;
  onClose: () => void;
}

export default function WorkoutForm({ date, existingWorkout, onClose }: WorkoutFormProps) {
  const [name, setName] = useState(existingWorkout?.name || '');
  const [sportType, setSportType] = useState(existingWorkout?.sport_type || '');
  const [duration, setDuration] = useState<number | undefined>(existingWorkout?.duration || undefined);
  const [notes, setNotes] = useState(existingWorkout?.notes || '');
  const [isLoading, setIsLoading] = useState(false);

  const { addWorkout, updateWorkout } = useWorkoutsStore();

  useEffect(() => {
    if (existingWorkout) {
      setName(existingWorkout.name);
      setSportType(existingWorkout.sport_type);
      setDuration(existingWorkout.duration || undefined);
      setNotes(existingWorkout.notes || '');
    }
  }, [existingWorkout]);

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
      if (existingWorkout) {
        await updateWorkout(existingWorkout.id, {
          name,
          sport_type: sportType,
          duration,
          notes: notes.trim() ? notes : undefined,
        });
        toast.success('Workout updated successfully');
      } else {
        await addWorkout({
          name,
          sport_type: sportType,
          date: format(date, 'yyyy-MM-dd'),
          duration,
          notes: notes.trim() ? notes : undefined,
        });
        toast.success('Workout added successfully');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${existingWorkout ? 'update' : 'add'} workout`);
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
              {existingWorkout ? 'Updating...' : 'Saving...'}
            </span>
          ) : (
            existingWorkout ? 'Update Workout' : 'Add Workout'
          )}
        </button>
      </div>
    </form>
  );
}