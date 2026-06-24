import Board from './components/Board'
import GameOverMenu from './components/GameOverMenu'
import NextPiece from './components/NextPiece'
import Scoreboard from './components/Scoreboard'
import { useGameLoop } from './hooks/useGameLoop'
import { useKeyboard } from './hooks/useKeyboard'

export default function App() {
  useGameLoop()
  useKeyboard()

  return (
    <div className="flex h-screen items-center justify-center bg-[#101216] font-pixel">
      <div
        className="relative flex items-start bg-[#222831]"
        style={{
          padding: 'calc(var(--cell) * 1.2)',
          border: 'calc(var(--cell) * 0.15) solid black',
        }}
      >
        <Board />

        <div
          className="flex flex-col items-center"
          style={{ marginLeft: 'calc(var(--cell) * 3)' }}
        >
          <NextPiece />
          <Scoreboard />
        </div>

        <GameOverMenu />
      </div>
    </div>
  )
}
