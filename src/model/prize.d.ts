export interface Prize {
  _id: ObjectId
  templateIndex: number
  frameIndex: number
  contents: {
    year: string
    month: string
    day: string
    text1?: string
    text2?: string
    text3?: string
    // text 개수 가변적
  }
  trophyIndex: number
  message: string
  author: string
}

export const filteredPrize = (prize: Prize) => {
  return {
    templateIndex: prize.templateIndex,
    frameIndex: prize.frameIndex,
    contents: prize.contents,
    trophyIndex: prize.trophyIndex,
    message: prize.message,
    author: prize.author,
  }
}
