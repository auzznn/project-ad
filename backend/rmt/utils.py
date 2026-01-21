import calendar

class MonthHelper():
    def __init__(self, year: int, month: int) -> None:
        self.calendar_matrix = calendar.monthcalendar(year, month)
    
    def get_num_week(self) -> int:
        return len(self.calendar_matrix)

    def get_week_of_date(self, date: int) -> int:
        """
        Returns the week index (1-based) for a given day of the month.
        Returns -1 if the date is invalid for that month.
        """
        for index, week in enumerate(self.calendar_matrix):
            if date in week:
                return index + 1  # Adding 1 to make it Week 1, Week 2, etc.
        
        return -1