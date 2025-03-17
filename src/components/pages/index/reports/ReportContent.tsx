
import React from "react";

const ReportContent = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            דוחות זמינים בקרוב
          </h3>
          <p className="text-sm text-muted-foreground">
            דוחות פיננסיים יהיו זמינים בקרוב. עקוב אחר העדכונים.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportContent;
