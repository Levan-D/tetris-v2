import Board from "./components/Board"
import GameOverMenu from "./components/GameOverMenu"
import HoldPiece from "./components/HoldPiece"
import NextPiece from "./components/NextPiece"
import RulesInfo from "./components/RulesInfo"
import Scoreboard from "./components/Scoreboard"
import { useGameLoop } from "./hooks/useGameLoop"
import { useKeyboard } from "./hooks/useKeyboard"

export default function App() {
  useGameLoop()
  useKeyboard()

  return (
    <div className="flex h-screen select-none items-center justify-center bg-canvas font-pixel">
      <div className="relative flex items-start bg-shell  p-pad border-game border-frame-dark rounded-game-lg">
        <div className="flex flex-col items-center w-col mr-lg">
          <HoldPiece />
        </div>

        <Board />

        <div className="flex flex-col items-center w-col ml-lg">
          <NextPiece />
          <Scoreboard />
          <RulesInfo />
        </div>

        <GameOverMenu />
      </div>
    </div>
  )
}
