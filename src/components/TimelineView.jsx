import { useMemo, useRef, useState, useEffect } from 'react';

const CELL_WIDTH = 28;
const HANDLE_WIDTH = 8;

const getDateOnly = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const addDays = (dateString, days) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const dayDiff = (fromDate, toDate) => {
  const msInDay = 24 * 60 * 60 * 1000;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  return Math.round((to - from) / msInDay);
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return 'No deadline';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'No deadline';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const overlapsWindow = (startDate, endDate, windowStart, windowEnd) => {
  return !(endDate < windowStart || startDate > windowEnd);
};

const getTaskPreviewRange = (task, mode, targetDate) => {
  if (!task || !targetDate) return null;

  if (mode === 'resize-start') {
    const nextStart = targetDate > task.dueDate ? task.dueDate : targetDate;
    return {
      startDate: nextStart,
      dueDate: task.dueDate,
    };
  }

  if (mode === 'resize-end') {
    const nextEnd = targetDate < task.startDate ? task.startDate : targetDate;
    return {
      startDate: task.startDate,
      dueDate: nextEnd,
    };
  }

  const durationDays = Math.max(0, dayDiff(task.startDate, task.dueDate));
  return {
    startDate: targetDate,
    dueDate: addDays(targetDate, durationDays),
  };
};

const TimelineView = ({
  scholarships,
  independentTasks,
  onShiftTask,
  onCreateIndependentTask,
  onUpdateIndependentTask,
  onDeleteIndependentTask,
  onMoveIndependentTask,
  onResizeIndependentTaskStart,
  onResizeIndependentTaskEnd,
  onEdit,
}) => {
  const [windowDays, setWindowDays] = useState(90);
  const [anchorDate, setAnchorDate] = useState(getDateOnly(new Date()));
  const [activeTaskDragState, setActiveTaskDragState] = useState(null);
  const [draftTask, setDraftTask] = useState({
    id: null,
    text: '',
    startDate: getDateOnly(new Date()),
    dueDate: addDays(getDateOnly(new Date()), 7),
    priority: 3,
    taskStatus: 'pending',
  });

  const timelineContainerRef = useRef(null);
  const dragStateRef = useRef(null);

  // Helper: Convert client X coordinate to date
  const pixelToDate = (clientX) => {
    // Find the grid element
    const grid = document.querySelector('[data-timeline-grid]');
    if (!grid) return null;

    const gridRect = grid.getBoundingClientRect();
    const gridX = clientX - gridRect.left;
    
    if (gridX < 0 || gridX > gridRect.width) return null;

    const offset = Math.floor(gridX / CELL_WIDTH);
    if (offset < 0 || offset >= windowDays) return null;

    const dateRange = Array.from({ length: windowDays }, (_, idx) => addDays(anchorDate, idx));
    return dateRange[offset] || null;
  };

  // Pointer move handler
  useEffect(() => {
    if (!activeTaskDragState) return;

    const handlePointerMove = (e) => {
      const targetDate = pixelToDate(e.clientX);
      if (targetDate) {
        dragStateRef.current = { ...dragStateRef.current, hoverDate: targetDate };
        // Trigger a state update to re-render preview
        setActiveTaskDragState((prev) => ({ ...prev, hoverDate: targetDate }));
      }
    };

    const handlePointerUp = async (e) => {
      if (!dragStateRef.current) {
        setActiveTaskDragState(null);
        return;
      }

      const state = dragStateRef.current;
      const targetDate = pixelToDate(e.clientX);

      if (targetDate) {
        try {
          if (state.type === 'scholarly') {
            await onShiftTask(state.scholarshipId, targetDate);
          } else if (state.type === 'independent-task') {
            if (state.mode === 'resize-start') {
              await onResizeIndependentTaskStart(state.taskId, targetDate);
            } else if (state.mode === 'resize-end') {
              await onResizeIndependentTaskEnd(state.taskId, targetDate);
            } else {
              await onMoveIndependentTask(state.taskId, targetDate);
            }
          }
        } catch (error) {
          console.error('Error during timeline drag:', error);
        }
      }

      setActiveTaskDragState(null);
      dragStateRef.current = null;
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveTaskDragState(null);
        dragStateRef.current = null;
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTaskDragState, windowDays, anchorDate, onShiftTask, onMoveIndependentTask, onResizeIndependentTaskStart, onResizeIndependentTaskEnd]);

  const dateRange = useMemo(() => {
    const start = anchorDate || getDateOnly(new Date());
    return Array.from({ length: windowDays }, (_, idx) => addDays(start, idx));
  }, [anchorDate, windowDays]);

  const visibleStart = dateRange[0];
  const visibleEnd = dateRange[dateRange.length - 1];

  const visibleScholarships = useMemo(() => {
    return scholarships
      .map((scholarship) => ({
        ...scholarship,
        deadlineDate: getDateOnly(scholarship.deadline),
      }))
      .filter((scholarship) => {
        if (!scholarship.deadlineDate) return false;
        return scholarship.deadlineDate >= visibleStart && scholarship.deadlineDate <= visibleEnd;
      })
      .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
  }, [scholarships, visibleStart, visibleEnd]);

  const visibleIndependentTasks = useMemo(() => {
    return (independentTasks || [])
      .map((task) => {
        const dueDate = getDateOnly(task.dueDate);
        const startDate = getDateOnly(task.startDate) || dueDate;
        return {
          ...task,
          startDate,
          dueDate,
        };
      })
      .filter((task) => task.startDate && task.dueDate)
      .filter((task) => overlapsWindow(task.startDate, task.dueDate, visibleStart, visibleEnd))
      .sort((a, b) => {
        if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
        return (a.order || 0) - (b.order || 0);
      });
  }, [independentTasks, visibleStart, visibleEnd]);

  const activeTaskPreview = useMemo(() => {
    if (!activeTaskDragState?.hoverDate || activeTaskDragState.type !== 'independent-task') return null;

    const allTasks = (independentTasks || [])
      .map((task) => {
        const dueDate = getDateOnly(task.dueDate);
        const startDate = getDateOnly(task.startDate) || dueDate;
        return { ...task, startDate, dueDate };
      });
    
    const task = allTasks.find((item) => item.id === activeTaskDragState.taskId);
    if (!task) return null;

    const previewRange = getTaskPreviewRange(task, activeTaskDragState.mode, activeTaskDragState.hoverDate);
    if (!previewRange) return null;

    const previewStartOffset = Math.max(0, Math.min(windowDays - 1, dayDiff(dateRange[0], previewRange.startDate)));
    const previewEndOffset = Math.max(previewStartOffset, Math.min(windowDays - 1, dayDiff(dateRange[0], previewRange.dueDate)));

    return {
      taskId: task.id,
      mode: activeTaskDragState.mode,
      startDate: previewRange.startDate,
      dueDate: previewRange.dueDate,
      startOffset: previewStartOffset,
      span: Math.max(1, previewEndOffset - previewStartOffset + 1),
    };
  }, [activeTaskDragState, independentTasks, windowDays, dateRange]);

  const dragModeLabel = activeTaskDragState?.mode === 'resize-start'
    ? 'Resize Start'
    : activeTaskDragState?.mode === 'resize-end'
      ? 'Resize End'
      : 'Move';

  const handleScholarshipPointerDown = (e, scholarshipId) => {
    e.preventDefault();
    dragStateRef.current = {
      type: 'scholarly',
      scholarshipId,
      mode: 'move',
      hoverDate: null,
    };
    setActiveTaskDragState(dragStateRef.current);
  };

  const handleTaskBarPointerDown = (e, task, mode = 'move') => {
    e.preventDefault();
    dragStateRef.current = {
      type: 'independent-task',
      taskId: task.id,
      mode,
      startDate: task.startDate,
      dueDate: task.dueDate,
      hoverDate: null,
    };
    setActiveTaskDragState(dragStateRef.current);
  };

  const resetDraft = () => {
    setDraftTask({
      id: null,
      text: '',
      startDate: getDateOnly(new Date()),
      dueDate: addDays(getDateOnly(new Date()), 7),
      priority: 3,
      taskStatus: 'pending',
    });
  };

  const handleSaveTask = async (event) => {
    event.preventDefault();
    const text = draftTask.text.trim();
    if (!text || !draftTask.startDate || !draftTask.dueDate) return;

    const startDate = draftTask.startDate <= draftTask.dueDate ? draftTask.startDate : draftTask.dueDate;
    const dueDate = draftTask.dueDate >= draftTask.startDate ? draftTask.dueDate : draftTask.startDate;

    if (draftTask.id) {
      await onUpdateIndependentTask(draftTask.id, {
        text,
        startDate,
        dueDate,
        priority: Number(draftTask.priority),
        taskStatus: draftTask.taskStatus,
      });
      resetDraft();
      return;
    }

    await onCreateIndependentTask({
      text,
      startDate,
      dueDate,
      priority: Number(draftTask.priority),
      taskStatus: draftTask.taskStatus,
    });
    resetDraft();
  };

  const startEditTask = (task) => {
    setDraftTask({
      id: task.id,
      text: task.text || '',
      startDate: task.startDate,
      dueDate: task.dueDate,
      priority: task.priority || 3,
      taskStatus: task.taskStatus || 'pending',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Scholarship Timeline</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Drag a scholarship marker to reschedule its deadline.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAnchorDate(addDays(anchorDate, -7))}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              - 1 Week
            </button>
            <button
              onClick={() => setAnchorDate(getDateOnly(new Date()))}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900"
            >
              Today
            </button>
            <select
              value={windowDays}
              onChange={(event) => setWindowDays(Number(event.target.value))}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={120}>120 days</option>
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveTask} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {draftTask.id ? 'Edit Independent Task' : 'Add Independent Task'}
          </h3>
          {draftTask.id && (
            <button
              type="button"
              onClick={resetDraft}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text"
            value={draftTask.text}
            onChange={(event) => setDraftTask((prev) => ({ ...prev, text: event.target.value }))}
            placeholder="Task name"
            required
            className="lg:col-span-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="date"
            value={draftTask.startDate}
            onChange={(event) => setDraftTask((prev) => ({ ...prev, startDate: event.target.value }))}
            required
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="date"
            value={draftTask.dueDate}
            onChange={(event) => setDraftTask((prev) => ({ ...prev, dueDate: event.target.value }))}
            required
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <select
            value={draftTask.priority}
            onChange={(event) => setDraftTask((prev) => ({ ...prev, priority: Number(event.target.value) }))}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value={1}>Priority 1</option>
            <option value={2}>Priority 2</option>
            <option value={3}>Priority 3</option>
            <option value={4}>Priority 4</option>
            <option value={5}>Priority 5</option>
          </select>
          <select
            value={draftTask.taskStatus}
            onChange={(event) => setDraftTask((prev) => ({ ...prev, taskStatus: event.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {draftTask.id ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <div className="min-w-max" ref={timelineContainerRef}>
            <div className="grid grid-cols-[360px_auto] border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">Scholarship</div>
              <div className="flex bg-gray-50 dark:bg-gray-900" data-timeline-grid>
                {dateRange.map((dateString) => (
                  <div
                    key={dateString}
                    className="text-[10px] text-center py-3 border-l border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                    style={{ width: `${CELL_WIDTH}px` }}
                    title={dateString}
                  >
                    {new Date(dateString).getDate()}
                  </div>
                ))}
              </div>
            </div>

            {activeTaskDragState && (
              <div className="px-4 py-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b border-gray-200 dark:border-gray-700">
                Drag Mode: {dragModeLabel}{activeTaskDragState.hoverDate ? ` · Target ${formatDisplayDate(activeTaskDragState.hoverDate)}` : ''}
              </div>
            )}

            {visibleScholarships.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">No scholarship deadlines in selected window.</div>
            ) : (
              visibleScholarships.map((scholarship) => {
                const offset = Math.max(0, Math.min(windowDays - 1, dayDiff(visibleStart, scholarship.deadlineDate)));

                return (
                  <div key={scholarship.id} className="grid grid-cols-[360px_auto] border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-3 space-y-2">
                      <button
                        onClick={() => onEdit?.(scholarship)}
                        className="text-left text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {scholarship.name}
                      </button>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">{formatDisplayDate(scholarship.deadlineDate)}</span>
                        {scholarship.provider && (
                          <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{scholarship.provider}</span>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="flex">
                        {dateRange.map((dateString) => (
                          <div
                            key={`${scholarship.id}-${dateString}`}
                            className="h-full min-h-[78px] border-l border-gray-100 dark:border-gray-700/60"
                            style={{ width: `${CELL_WIDTH}px` }}
                          />
                        ))}
                      </div>
                      <div
                        onPointerDown={(e) => handleScholarshipPointerDown(e, scholarship.id)}
                        className="absolute top-1/2 -translate-y-1/2 h-8 rounded-md px-3 flex items-center text-xs font-medium cursor-grab active:cursor-grabbing bg-blue-600 text-white"
                        style={{
                          left: `${offset * CELL_WIDTH + 2}px`,
                          width: `${CELL_WIDTH - 4}px`,
                          opacity: activeTaskDragState?.type === 'scholarly' && activeTaskDragState?.scholarshipId === scholarship.id ? 0.55 : 1,
                        }}
                        title="Drag to a date cell to reschedule deadline"
                      >
                        DL
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div className="grid grid-cols-[360px_auto] border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
              <div className="px-4 py-3 text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">Independent Tasks</div>
              <div className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">Drag bar body to move range. Drag left/right handles to set start/end.</div>
            </div>

            {visibleIndependentTasks.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No independent tasks in selected window.</div>
            ) : (
              visibleIndependentTasks.map((task) => {
                const startOffset = Math.max(0, Math.min(windowDays - 1, dayDiff(visibleStart, task.startDate)));
                const endOffset = Math.max(startOffset, Math.min(windowDays - 1, dayDiff(visibleStart, task.dueDate)));
                const span = Math.max(1, endOffset - startOffset + 1);

                return (
                  <div key={task.id} className="grid grid-cols-[360px_auto] border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-3 space-y-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{task.text}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                          {formatDisplayDate(task.startDate)} to {formatDisplayDate(task.dueDate)}
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">P{task.priority || 3}</span>
                        <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">{task.taskStatus || 'pending'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditTask(task)}
                          className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteIndependentTask(task.id)}
                          className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="flex">
                        {dateRange.map((dateString) => (
                          <div
                            key={`task-${task.id}-${dateString}`}
                            className="h-full min-h-[78px] border-l border-gray-100 dark:border-gray-700/60"
                            style={{ width: `${CELL_WIDTH}px` }}
                          />
                        ))}
                      </div>
                      {activeTaskPreview?.taskId === task.id && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-10 rounded-md border-2 border-dashed border-indigo-300 dark:border-indigo-500 bg-indigo-100/60 dark:bg-indigo-900/30 pointer-events-none"
                          style={{
                            left: `${activeTaskPreview.startOffset * CELL_WIDTH + 2}px`,
                            width: `${activeTaskPreview.span * CELL_WIDTH - 4}px`,
                          }}
                          title={`Preview: ${formatDisplayDate(activeTaskPreview.startDate)} to ${formatDisplayDate(activeTaskPreview.dueDate)}`}
                        />
                      )}
                      <div
                        onPointerDown={(e) => handleTaskBarPointerDown(e, task, 'move')}
                        className="absolute top-1/2 -translate-y-1/2 h-9 rounded-md flex items-center text-xs font-medium cursor-grab active:cursor-grabbing bg-indigo-600 text-white select-none"
                        style={{
                          left: `${startOffset * CELL_WIDTH + 2}px`,
                          width: `${span * CELL_WIDTH - 4}px`,
                          opacity: activeTaskDragState?.type === 'independent-task' && activeTaskDragState?.taskId === task.id ? 0.6 : 1,
                        }}
                        title="Drag bar body to move range. Drag left/right handles to set start/end."
                      >
                        <div
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            handleTaskBarPointerDown(event, task, 'resize-start');
                          }}
                          className="w-2 h-full rounded-l-md bg-indigo-800 cursor-ew-resize"
                          title="Drag to update start date"
                        />
                        <div className="flex-1 px-2 truncate">{task.text}</div>
                        <div
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            handleTaskBarPointerDown(event, task, 'resize-end');
                          }}
                          className="w-2 h-full rounded-r-md bg-indigo-800 cursor-ew-resize"
                          title="Drag to update end date"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {visibleScholarships.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">No scholarship deadlines in selected window.</div>
          ) : (
            visibleScholarships.map((scholarship) => (
              <div key={`mobile-${scholarship.id}`} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      onClick={() => onEdit?.(scholarship)}
                      className="text-left text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {scholarship.name}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Deadline: {formatDisplayDate(scholarship.deadlineDate)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onShiftTask(scholarship.id, addDays(scholarship.deadlineDate, -1))}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    -1 day
                  </button>
                  <button
                    onClick={() => onShiftTask(scholarship.id, addDays(scholarship.deadlineDate, 1))}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    +1 day
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/60 text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
            Independent Tasks
          </div>

          {visibleIndependentTasks.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No independent tasks in selected window.</div>
          ) : (
            visibleIndependentTasks.map((task) => (
              <div key={`mobile-task-${task.id}`} className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{task.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDisplayDate(task.startDate)} to {formatDisplayDate(task.dueDate)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onResizeIndependentTaskStart(task.id, addDays(task.startDate, -1))}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    Start -1 day
                  </button>
                  <button
                    onClick={() => onResizeIndependentTaskStart(task.id, addDays(task.startDate, 1))}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    Start +1 day
                  </button>
                  <button
                    onClick={() => onResizeIndependentTaskEnd(task.id, addDays(task.dueDate, -1))}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    End -1 day
                  </button>
                  <button
                    onClick={() => onResizeIndependentTaskEnd(task.id, addDays(task.dueDate, 1))}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    End +1 day
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditTask(task)}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteIndependentTask(task.id)}
                    className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
