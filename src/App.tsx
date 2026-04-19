import { FilterTabs } from './components/FilterTabs'
import { TodoInput } from './components/TodoInput'
import { TodoList } from './components/TodoList'
import { UndoToastProvider } from './components/UndoToast'

export function App() {
  return (
    <UndoToastProvider>
      <main className="mx-auto max-w-[560px] px-4 py-8 sm:px-5 md:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
        </header>

        <div className="flex flex-col gap-4">
          <TodoInput autoFocus />
          <FilterTabs />
          <TodoList />
        </div>
      </main>
    </UndoToastProvider>
  )
}
