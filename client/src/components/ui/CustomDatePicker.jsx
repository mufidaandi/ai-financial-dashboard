import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function CustomDatePicker({ value, onChange, placeholder = "Pick a date", disabled = false, name, min, max, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Handle clicks outside the date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (selectedDate) => {
    if (onChange) {
      // Format date as YYYY-MM-DD using local timezone to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onChange({ target: { name: name, value: formattedDate } });
    }
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return null;
    
    // Parse date string as local date to avoid timezone issues
    // For YYYY-MM-DD format, create date using individual components
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    
    const date = new Date(year, month - 1, day); // month is 0-indexed
    if (isNaN(date.getTime())) return null;
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const displayDate = formatDisplayDate(value);

  // Calendar generation functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isDateDisabled = (date) => {
    if (!date) return false;
    
    // Disable dates before min date
    if (min) {
      const [minYear, minMonth, minDay] = min.split('-').map(Number);
      const minDate = new Date(minYear, minMonth - 1, minDay);
      if (date < minDate) return true;
    }
    
    // Disable dates after max date
    if (max) {
      const [maxYear, maxMonth, maxDay] = max.split('-').map(Number);
      const maxDate = new Date(maxYear, maxMonth - 1, maxDay);
      if (date > maxDate) return true;
    }
    
    return false;
  };

  const isSelected = (date) => {
    if (!value || !date) return false;
    
    // Parse the value string as local date to avoid timezone issues
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return false;
    
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 && // month is 0-indexed in Date
           date.getDate() === day;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`flex w-full items-center justify-start rounded-md border px-3 py-2 text-left text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          disabled 
            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
            : 'border-gray-300 bg-white hover:bg-gray-50 focus:border-blue-500 focus:ring-blue-500'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Choose date"
        aria-disabled={disabled}
      >
        <CalendarIcon className={`mr-2 h-4 w-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
        <span className={displayDate ? "text-gray-900" : "text-gray-500"}>
          {displayDate || placeholder}
        </span>
      </button>
      
      {isOpen && !disabled && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-1 rounded-md border border-gray-200 bg-white p-4 shadow-lg min-w-[280px]"
          role="dialog"
          aria-label="Date picker"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-medium dark:text-gray-700">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {generateCalendarDays().map((date, index) => (
              <div key={index} className="p-1">
                {date ? (
                  <button
                    type="button"
                    onClick={() => !isDateDisabled(date) && handleSelect(date)}
                    disabled={isDateDisabled(date)}
                    className={`w-8 h-8 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDateDisabled(date)
                        ? 'text-gray-300 cursor-not-allowed'
                        : isSelected(date)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isToday(date)
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label={`Select ${date.toLocaleDateString()}`}
                    aria-disabled={isDateDisabled(date)}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <div className="w-8 h-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}