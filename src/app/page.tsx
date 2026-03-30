"use client";

import { useState, useRef, useCallback } from "react";

type Priority = "high" | "medium" | "low";
type Category = "work" | "private" | "other";

type Todo = {
  id: number;
  text: string;
  done: boolean;
  priority: Priority;
  category: Category;
  deadline: string;
  animating: boolean;
};

const PRIORITY_LABEL: Record<Priority, string> = { high: "高", medium: "中", low: "低" };
const PRIORITY_COLOR: Record<Priority, string> = {
  high:   "bg-red-100 text-red-600 border-red-200",
  medium: "bg-amber-100 text-amber-600 border-amber-200",
  low:    "bg-emerald-100 text-emerald-700 border-emerald-200",
};
const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-red-500", medium: "bg-amber-400", low: "bg-emerald-400",
};

const CATEGORY_LABEL: Record<Category, string> = { work: "仕事", private: "プライベート", other: "その他" };
const CATEGORY_COLOR: Record<Category, string> = {
  work:    "bg-teal-100 text-teal-700 border-teal-200",
  private: "bg-violet-100 text-violet-700 border-violet-200",
  other:   "bg-slate-100 text-slate-600 border-slate-200",
};

function isOverdue(deadline: string, done: boolean) {
  if (!deadline || done) return false;
  return new Date(deadline) < new Date(new Date().toDateString());
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("work");
  const [deadline, setDeadline] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTodo = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: Date.now(), text, done: false, priority, category, deadline, animating: true },
      ...prev,
    ]);
    setInput("");
    setTimeout(() => {
      setTodos((prev) => prev.map((t) => t.animating && t.text === text ? { ...t, animating: false } : t));
    }, 350);
    inputRef.current?.focus();
  }, [input, priority, category, deadline]);

  const toggleTodo = useCallback((id: number) => {
    setTodos((prev) =>
      prev.map((t) => t.id === id ? { ...t, done: !t.done, animating: true } : t)
    );
    setTimeout(() => {
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, animating: false } : t));
    }, 400);
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filtered = todos.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  });

  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const rate = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-start justify-center pt-10 px-4 pb-16">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-emerald-800 tracking-tight drop-shadow-sm">
            ✅ ToDoリスト
          </h1>
          <p className="mt-1 text-sm text-emerald-500 font-medium">
            タスクを管理して、毎日を快適に。
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-emerald-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-emerald-700">完了率</span>
            <span className="text-2xl font-extrabold text-emerald-600">{rate}%</span>
          </div>
          {/* Bar */}
          <div className="relative h-4 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="progress-bar h-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-inner transition-all duration-700"
              style={{ width: `${rate}%` }}
            />
          </div>
          <div className="mt-2 flex gap-4 text-xs text-slate-400">
            <span>全{total}件</span>
            <span className="text-emerald-500 font-semibold">完了 {done}件</span>
            <span>未完了 {total - done}件</span>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-emerald-100 p-5 mb-6 space-y-3">
          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="新しいタスクを入力..."
            className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-white text-slate-800 placeholder-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />

          <div className="flex flex-wrap gap-2">
            {/* Priority */}
            <div className="flex gap-1 items-center">
              <span className="text-xs text-slate-400 mr-1">優先度</span>
              {(["high", "medium", "low"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                    priority === p
                      ? PRIORITY_COLOR[p] + " shadow-sm ring-1 ring-offset-1 ring-current"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="flex gap-1 items-center">
              <span className="text-xs text-slate-400 mr-1">カテゴリ</span>
              {(["work", "private", "other"] as Category[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                    category === c
                      ? CATEGORY_COLOR[c] + " shadow-sm ring-1 ring-offset-1 ring-current"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-center">
            {/* Deadline */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-slate-400 whitespace-nowrap">締め切り</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-emerald-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
            </div>
            <button
              onClick={addTodo}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all"
            >
              追加
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className="text-xs text-slate-400 font-medium">フィルター</span>
          {/* Priority filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterPriority("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${filterPriority === "all" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
            >
              全優先度
            </button>
            {(["high", "medium", "low"] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(filterPriority === p ? "all" : p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${filterPriority === p ? PRIORITY_COLOR[p] + " shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[p]}`} />
                {PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
          {/* Category filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${filterCategory === "all" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
            >
              全カテゴリ
            </button>
            {(["work", "private", "other"] as Category[]).map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(filterCategory === c ? "all" : c)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${filterCategory === c ? CATEGORY_COLOR[c] + " shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        <ul className="space-y-2">
          {filtered.length === 0 && (
            <li className="text-center text-slate-300 py-16 text-sm select-none">
              {todos.length === 0 ? "タスクがありません" : "条件に一致するタスクがありません"}
            </li>
          )}
          {filtered.map((todo) => {
            const overdue = isOverdue(todo.deadline, todo.done);
            return (
              <li
                key={todo.id}
                className={`todo-enter flex items-start gap-3 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border transition group ${
                  overdue ? "border-red-200 bg-red-50/60" : "border-emerald-100 hover:border-emerald-200"
                } ${todo.done ? "opacity-60" : ""}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={todo.done ? "未完了に戻す" : "完了にする"}
                  className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.animating ? "todo-check-pop" : ""
                  } ${
                    todo.done
                      ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-200"
                      : "border-emerald-300 hover:border-emerald-500"
                  }`}
                >
                  {todo.done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className={`block text-sm font-medium leading-snug transition ${todo.done ? "line-through text-slate-300" : "text-slate-700"}`}>
                    {todo.text}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                    {/* Priority badge */}
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${PRIORITY_COLOR[todo.priority]}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${PRIORITY_DOT[todo.priority]}`} />
                      {PRIORITY_LABEL[todo.priority]}
                    </span>
                    {/* Category badge */}
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${CATEGORY_COLOR[todo.category]}`}>
                      {CATEGORY_LABEL[todo.category]}
                    </span>
                    {/* Deadline */}
                    {todo.deadline && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                        overdue
                          ? "bg-red-100 text-red-600 border-red-200"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}>
                        {overdue ? "⚠ " : "📅 "}{todo.deadline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="削除"
                  className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Clear completed */}
        {todos.some((t) => t.done) && (
          <div className="mt-4 text-right">
            <button
              onClick={() => setTodos((prev) => prev.filter((t) => !t.done))}
              className="text-xs text-slate-400 hover:text-red-400 transition"
            >
              完了済みを一括削除
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
