import { Background, Board, GameOverMenu, HoldPiece, NextPiece, Scoreboard } from "./components/game"
import { MainMenu } from "./components/mainMenu"
import { useAutoPause } from "./hooks/useAutoPause"
import { useGameLoop } from "./hooks/useGameLoop"
import { useKeyboard } from "./hooks/useKeyboard"

export default function App() {
  useGameLoop()
  useKeyboard()
  useAutoPause()

  return (
    <div className="flex h-screen select-none items-center justify-center bg-canvas font-pixel">
      <Background />
      <div className="relative flex items-start bg-shell  p-pad border-game border-frame-dark rounded-game-lg">
        <div className="flex flex-col items-center w-col mr-lg">
          <HoldPiece />
        </div>

        <Board />

        <div className="flex flex-col items-center w-col ml-lg">
          <NextPiece />
          <Scoreboard />
        </div>

        <GameOverMenu />
        <MainMenu />
      </div>
    </div>
  )
}
