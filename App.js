import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 60;

const KUNAI_WIDTH = 8;
const KUNAI_HEIGHT = 25;

const SHURIKEN_SIZE = 40;

export default function App() {
  const [playerX, setPlayerX] = useState((screenWidth - PLAYER_WIDTH) / 2);
  const [kunais, setKunais] = useState([]);
  const [shurikens, setShurikens] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);


  const kunaisRef = useRef(kunais);
  const shurikensRef = useRef(shurikens);
  const playerXRef = useRef(playerX);
  const gameOverRef = useRef(gameOver);

  useEffect(() => {
    kunaisRef.current = kunais;
  }, [kunais]);
  useEffect(() => {
    shurikensRef.current = shurikens;
  }, [shurikens]);
  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);


  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x }) => {

      const move = x * 30;
      setPlayerX((prevX) => {
        const allowedValue = Math.max(
          0,
          Math.min(prevX + move, screenWidth - PLAYER_WIDTH)
        );
        return allowedValue;
      });
    });

    return () => subscription.remove();
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setKunais((prev) =>
        prev
          .map((k) => ({ ...k, y: k.y + 25 })) 
          .filter((k) => {

            const kunaiTop = screenHeight - k.y - KUNAI_HEIGHT;
            return kunaiTop + KUNAI_HEIGHT > -50;
          })
      );
    }, 40); 

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const newShuriken = {
        id: Date.now() + Math.random(),
        x: Math.random() * (screenWidth - SHURIKEN_SIZE),
        y: -SHURIKEN_SIZE, 
        rotation: 0,
      };
      setShurikens((prev) => [...prev, newShuriken]);
    }, 1400); 

    return () => clearInterval(interval);
  }, [gameOver]);


  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setShurikens((prev) =>
        prev
          .map((s) => ({
            ...s,
            y: s.y + 7, 
            rotation: (s.rotation + 18) % 360,
          }))
          .filter((s) => s.y < screenHeight + 100)
      );
    }, 40);

    return () => clearInterval(interval);
  }, [gameOver]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameOverRef.current) return;

      const currentKunais = [...kunaisRef.current];
      let currentShurikens = [...shurikensRef.current];
      let scoreIncrease = 0;


      for (let kIdx = currentKunais.length - 1; kIdx >= 0; kIdx--) {
        const kunai = currentKunais[kIdx];

        const kunaiTop = screenHeight - kunai.y - KUNAI_HEIGHT;
        const kunaiBottom = kunaiTop + KUNAI_HEIGHT;
        const kunaiLeft = kunai.x;
        const kunaiRight = kunai.x + KUNAI_WIDTH;

        for (let sIdx = currentShurikens.length - 1; sIdx >= 0; sIdx--) {
          const sh = currentShurikens[sIdx];
          const shTop = sh.y;
          const shBottom = sh.y + SHURIKEN_SIZE;
          const shLeft = sh.x;
          const shRight = sh.x + SHURIKEN_SIZE;

          const horizOverlap = kunaiLeft < shRight && kunaiRight > shLeft;
          const vertOverlap =
            kunaiTop < shBottom && kunaiBottom > shTop;

          if (horizOverlap && vertOverlap) {

            currentShurikens.splice(sIdx, 1);
            currentKunais.splice(kIdx, 1);
            scoreIncrease += 10;
            break; 
          }
        }
      }


      const playerLeft = playerXRef.current;
      const playerRight = playerLeft + PLAYER_WIDTH;
      const playerTop = screenHeight - 80;
      const playerBottom = screenHeight - 20;

      for (let sh of currentShurikens) {
        const shTop = sh.y;
        const shBottom = sh.y + SHURIKEN_SIZE;
        if (
          shBottom > playerTop &&
          shTop < playerBottom &&
          sh.x < playerRight &&
          sh.x + SHURIKEN_SIZE > playerLeft
        ) {

          setGameOver(true);

          break;
        }
      }

      if (scoreIncrease > 0) {
        setScore((prev) => prev + scoreIncrease);
      }


      setKunais(currentKunais);
      setShurikens(currentShurikens);
    }, 50); 

    return () => clearInterval(interval);
  }, []);

  const throwKunai = () => {
    if (gameOver) return;

    const kunai = {
      id: Date.now() + Math.random(),
      x: playerX + (PLAYER_WIDTH - KUNAI_WIDTH) / 2,
      y: 60, 
    };

    setKunais((prev) => {
      const next = [...prev, kunai];
      kunaisRef.current = next;
      return next;
    });
  };

  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setShurikens([]);
    setKunais([]);
    setPlayerX((screenWidth - PLAYER_WIDTH) / 2);
  
    shurikensRef.current = [];
    kunaisRef.current = [];
    playerXRef.current = (screenWidth - PLAYER_WIDTH) / 2;
    gameOverRef.current = false;
  };

  return (
    <TouchableWithoutFeedback onPress={gameOver ? resetGame : throwKunai}>
      <View style={styles.container}>
        <StatusBar style="light" />

©
        <View style={styles.skyTop} />
        <View style={styles.skyMiddle} />
        <View style={styles.skyBottom} />

©
        <View style={styles.moon}>
          <View style={styles.moonCrater1} />
          <View style={styles.moonCrater2} />
          <View style={styles.moonCrater3} />
        </View>

©
        <View style={[styles.star, { top: 100, left: 50 }]} />
        <View style={[styles.star, { top: 150, left: 200 }]} />
        <View style={[styles.star, { top: 80, left: 300 }]} />
        <View style={[styles.star, { top: 200, left: 100 }]} />
        <View style={[styles.star, { top: 120, left: 350 }]} />

©
        <Text style={styles.score}>Score: {score}</Text>

©
        {shurikens.map((shuriken) => (
          <View
            key={shuriken.id}
            style={[
              styles.shuriken,
              {
                left: shuriken.x,
                top: shuriken.y,
                transform: [{ rotate: `${shuriken.rotation}deg` }],
              },
            ]}
          >
            <View style={styles.shurikenBlade1} />
            <View style={styles.shurikenBlade2} />
            <View style={styles.shurikenCenter} />
          </View>
        ))}

©
        {kunais.map((kunai) => (
          <View
            key={kunai.id}
            style={[styles.kunai, { left: kunai.x, bottom: kunai.y }]}
          >
            <View style={styles.kunaiTip} />
            <View style={styles.kunaiHandle} />
            <View style={styles.kunaiRing} />
          </View>
        ))}

©
        <View style={[styles.player, { left: playerX }]}>
©
          <View style={styles.ninjaHead}>
            <View style={styles.ninjaMask} />
            <View style={styles.ninjaEyes}>
              <View style={styles.eye} />
              <View style={styles.eye} />
            </View>
          </View>
©
          <View style={styles.ninjaBody}>
            <View style={styles.ninjaBelt} />
          </View>
©
          <View style={styles.ninjaArms}>
            <View style={styles.arm} />
            <View style={styles.arm} />
          </View>
©
          <View style={styles.ninjaLegs}>
            <View style={styles.leg} />
            <View style={styles.leg} />
          </View>
        </View>

        <Text style={styles.title}>NINJA DEFENSE</Text>
        <Text style={styles.instruction}>🥷 Tilt to move • Tap to throw kunai</Text>

        {gameOver && (
          <>
            <Text style={styles.gameOverText}>GAME OVER</Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            <Text style={styles.tapToRestart}>Tap to Restart</Text>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e27",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
  },
  skyTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: screenHeight / 3,
    backgroundColor: "#0a0e27",
  },
  skyMiddle: {
    position: "absolute",
    top: screenHeight / 3,
    left: 0,
    right: 0,
    height: screenHeight / 3,
    backgroundColor: "#151b3d",
  },
  skyBottom: {
    position: "absolute",
    top: (2 * screenHeight) / 3,
    left: 0,
    right: 0,
    height: screenHeight / 3,
    backgroundColor: "#1f2847",
  },
  moon: {
    position: "absolute",
    top: 80,
    right: 50,
    width: 80,
    height: 80,
    backgroundColor: "#f0e68c",
    borderRadius: 40,
    shadowColor: "#f0e68c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  moonCrater1: {
    position: "absolute",
    top: 15,
    left: 20,
    width: 12,
    height: 12,
    backgroundColor: "#e6d66a",
    borderRadius: 6,
  },
  moonCrater2: {
    position: "absolute",
    top: 40,
    left: 45,
    width: 8,
    height: 8,
    backgroundColor: "#e6d66a",
    borderRadius: 4,
  },
  moonCrater3: {
    position: "absolute",
    top: 50,
    left: 15,
    width: 10,
    height: 10,
    backgroundColor: "#e6d66a",
    borderRadius: 5,
  },
  star: {
    position: "absolute",
    width: 3,
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 1.5,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  score: {
    position: "absolute",
    top: 30,
    left: 20,
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Courier",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  player: {
    position: "absolute",
    bottom: 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    alignItems: "center",
  },
  ninjaHead: {
    width: 24,
    height: 24,
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  ninjaMask: {
    position: "absolute",
    bottom: 0,
    width: 24,
    height: 14,
    backgroundColor: "#1a1a1a",
    borderRadius: 3,
  },
  ninjaEyes: {
    flexDirection: "row",
    gap: 8,
    marginTop: -2,
  },
  eye: {
    width: 4,
    height: 6,
    backgroundColor: "#fff",
    borderRadius: 1,
  },
  ninjaBody: {
    width: 28,
    height: 22,
    backgroundColor: "#1a1a1a",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  ninjaBelt: {
    width: 28,
    height: 4,
    backgroundColor: "#ff4444",
    borderRadius: 1,
  },
  ninjaArms: {
    position: "absolute",
    top: 26,
    flexDirection: "row",
    width: 40,
    justifyContent: "space-between",
  },
  arm: {
    width: 6,
    height: 18,
    backgroundColor: "#1a1a1a",
    borderRadius: 3,
  },
  ninjaLegs: {
    flexDirection: "row",
    gap: 4,
    marginTop: 1,
  },
  leg: {
    width: 10,
    height: 12,
    backgroundColor: "#2a2a2a",
    borderRadius: 2,
  },
  instruction: {
    position: "absolute",
    top: 100,
    color: "#fff",
    fontFamily: "Courier",
    fontSize: 13,
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    position: "absolute",
    top: 60,
    color: "#ff4444",
    fontFamily: "Courier",
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 3,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  kunai: {
    position: "absolute",
    width: KUNAI_WIDTH,
    height: KUNAI_HEIGHT,
    alignItems: "center",
  },
  kunaiTip: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#c0c0c0",
  },
  kunaiHandle: {
    width: 3,
    height: 12,
    backgroundColor: "#8b4513",
  },
  kunaiRing: {
    width: 6,
    height: 3,
    backgroundColor: "#ffd700",
    borderRadius: 1.5,
  },
  shuriken: {
    position: "absolute",
    width: SHURIKEN_SIZE,
    height: SHURIKEN_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  shurikenBlade1: {
    position: "absolute",
    width: SHURIKEN_SIZE,
    height: 8,
    backgroundColor: "#c0c0c0",
    borderRadius: 2,
  },
  shurikenBlade2: {
    position: "absolute",
    width: 8,
    height: SHURIKEN_SIZE,
    backgroundColor: "#c0c0c0",
    borderRadius: 2,
  },
  shurikenCenter: {
    width: 12,
    height: 12,
    backgroundColor: "#404040",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#c0c0c0",
  },
  gameOverText: {
    position: "absolute",
    top: screenHeight / 2 - 60,
    color: "#ff4444",
    fontSize: 36,
    fontWeight: "bold",
    fontFamily: "Courier",
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
    zIndex: 1000,
  },
  finalScore: {
    position: "absolute",
    top: screenHeight / 2 - 10,
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Courier",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    zIndex: 1000,
  },
  tapToRestart: {
    position: "absolute",
    top: screenHeight / 2 + 30,
    color: "#ffd700",
    fontSize: 18,
    fontFamily: "Courier",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 1000,
  },
});
