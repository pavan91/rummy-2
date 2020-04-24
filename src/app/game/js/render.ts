import { Location } from "./location";

let context;
let otherPlayersCardsNum: { name: string; numberOfCards: number }[];
let playerName;
let discardPileDepth = 0.01;
let otherPlayersHands = new Map<
  string,
  {
    playerHand: Phaser.GameObjects.Image[];
    playerHandLoc: { x: number; y: number };
  }
>();

export function setPlayerName(name) {
  playerName = name;
}

export function setContext(outerContext) {
  context = outerContext;
}

export function setOtherPlayersCardsNum(cardsNumArray) {
  otherPlayersCardsNum = cardsNumArray;
}

export function renderCard(x, y, frameName, scale, isDragable) {
  let image = context.add.image(x, y, "cards", frameName);
  image.setScale(scale);
  image.setInteractive();
  if (isDragable) {
    context.input.setDraggable(image);
  }

  return image;
}

export function renderOtherPlayersHands() {
  const gameWidth = context.game.config.width as number;
  let cardsLocations = Location.getHandsLocations(gameWidth)[
    otherPlayersCardsNum.length
  ];
  let playerIndex = 0;
  for (let player of otherPlayersCardsNum) {
    if (player.name === playerName) {
      break;
    }
    playerIndex++;
  }
  let numOfPlayers = otherPlayersCardsNum.length;
  for (let i = 0; i < numOfPlayers - 1; i++) {
    let currentPlayerCards = [];
    let currentIndex = (i + 1 + playerIndex) % numOfPlayers;
    let currPlayer = otherPlayersCardsNum[currentIndex];
    for (let j = 0; j < currPlayer.numberOfCards; j++) {
      currentPlayerCards.push({ frame: "back" });
    }
    let playerHand = [];
    renderHand(currentPlayerCards, cardsLocations[i], 30, 0.7, playerHand);
    otherPlayersHands.set(currPlayer.name, {
      playerHand: playerHand,
      playerHandLoc: cardsLocations[i],
    });
  }
}

export function renderHand(
  playerCards: any[],
  center: { x: number; y: number },
  spaceBetweenCards: number,
  scale: number,
  playerHand
) {
  let currImage;

  if (playerCards) {
    let numberOfCards = playerCards.length;
    let i = 0;
    for (let card of playerCards) {
      currImage = renderCard(
        center.x + (i + 1 - numberOfCards / 2) * spaceBetweenCards,
        center.y,
        card.frame,
        scale,
        false
      );
      if (Array.isArray(playerHand)) {
        playerHand.push(currImage);
      } else {
        playerHand.set(card.frame, currImage);
      }
      ++i;
    }
  }

  return playerHand;
}

export function renderDeckCard(isDraggable) {
  return renderCard(
    Location.getDiscardPile().x - 140,
    Location.getDiscardPile().y,
    "back",
    0.8,
    isDraggable
  );
}

export function renderDeck(
  openingCardFrame,
  isDraggable
): {
  topDiscardPileImage: Phaser.GameObjects.Image;
  deckImages: Phaser.GameObjects.Image[];
} {
  let topDiscardPileImage = renderCard(
    Location.getDiscardPile().x,
    Location.getDiscardPile().y,
    openingCardFrame,
    0.8,
    isDraggable
  );
  topDiscardPileImage.depth = discardPileDepth;
  let deckImages = [];
  deckImages.push(renderDeckCard(false));
  deckImages.push(renderDeckCard(isDraggable));
  deckImages[0].depth = 1;
  deckImages[1].depth = 2;
  return { topDiscardPileImage: topDiscardPileImage, deckImages: deckImages };
}

export function reRenderHand(
  hand: Map<string, Phaser.GameObjects.Image>,
  center: { x: number; y: number },
  spaceBetweenCards: number,
  scale: number,
  isDraggable: boolean
) {
  let numberOfImages = hand.size;
  let i = 0;
  hand.forEach((image) => {
    image.setPosition(
      center.x + (i + 1 - numberOfImages / 2) * spaceBetweenCards,
      center.y
    );
    image.setScale(scale);
    image.depth = i;
    context.input.setDraggable(image, isDraggable);
    ++i;
  });
}

export function reRenderOtherPlayersHand(
  hand: Phaser.GameObjects.Image[],
  center: { x: number; y: number },
  spaceBetweenCards: number,
  scale: number,
  isDraggable: boolean
) {
  let numberOfImages = hand.length;
  let i = 0;
  hand.forEach((image) => {
    image.x = center.x + (i + 1 - numberOfImages / 2) * spaceBetweenCards;
    image.y = center.y;
    image.setScale(scale);
    image.depth = i * 10;
    context.input.setDraggable(image, isDraggable);
    ++i;
  });
}

export function otherPlayerDrawCard(
  card: Phaser.GameObjects.Image,
  playerName: string,
  newCardFrame?: string
) {
  card.depth = 100;
  let playerHandLoc = otherPlayersHands.get(playerName).playerHandLoc;
  let stepX = 8;
  let stepY = 8;
  if (playerHandLoc.x < card.x) {
    stepX *= -1;
  }
  if (playerHandLoc.y < card.y) {
    stepY *= -1;
  }
  let cardX;
  let cardY;
  let isArrive;

  let timer = setInterval(() => {
    isArrive = true;
    if (Math.abs(card.x - playerHandLoc.x) >= Math.abs(stepX)) {
      cardX = card.x + stepX;
      isArrive = false;
    }

    if (Math.abs(card.y - playerHandLoc.y) >= Math.abs(stepY)) {
      cardY = card.y + stepY;
      isArrive = false;
    }

    card.setPosition(cardX, cardY);

    if (isArrive) {
      clearInterval(timer);
      if (newCardFrame) {
        card.setFrame(newCardFrame);
      }
      let playerHand = otherPlayersHands.get(playerName).playerHand;
      let playerHandLoc = otherPlayersHands.get(playerName).playerHandLoc;
      playerHand.push(card);
      reRenderOtherPlayersHand(playerHand, playerHandLoc, 30, 0.7, false);
    }
  }, 25);
}

export function otherPlayerThrowCard(
  playerName: string,
  newCardFrame?: string
) {
  let playerHand = otherPlayersHands.get(playerName).playerHand;
  let randIndex = Math.floor(Math.random() * playerHand.length);
  let card = playerHand[randIndex];
  discardPileDepth += 0.01;
  card.depth = discardPileDepth;
  let openingCardLoc = Location.getDiscardPile();
  let stepX = 8;
  let stepY = 8;
  if (openingCardLoc.x < card.x) {
    stepX *= -1;
  }
  if (openingCardLoc.y < card.y) {
    stepY *= -1;
  }
  let cardX;
  let cardY;
  let isArrive;

  let timer = setInterval(() => {
    isArrive = true;
    if (Math.abs(card.x - openingCardLoc.x) >= Math.abs(stepX)) {
      cardX = card.x + stepX;
      isArrive = false;
    }

    if (Math.abs(card.y - openingCardLoc.y) >= Math.abs(stepY)) {
      cardY = card.y + stepY;
      isArrive = false;
    }

    card.setPosition(cardX, cardY);
    if (isArrive) {
      clearInterval(timer);
      card.x = openingCardLoc.x;
      card.y = openingCardLoc.y;
      card.setPosition(openingCardLoc.x, openingCardLoc.y);
      if (newCardFrame) {
        card.setFrame(newCardFrame);
        card.setScale(0.8);
      }
      let oplayerHand = otherPlayersHands.get(playerName).playerHand;
      let playerHandLoc = otherPlayersHands.get(playerName).playerHandLoc;
      oplayerHand.splice(randIndex, 1);
      reRenderOtherPlayersHand(oplayerHand, playerHandLoc, 30, 0.7, false);
    }
  }, 25);

  return card;
}
