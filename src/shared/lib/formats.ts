import { IErrorAnalysisEntity, IWord, SessionIeltsPartEnum, TokenType } from "../types"

export function formatCorrections(data: IErrorAnalysisEntity): string {
  if (!data.has_errors || !data.issues.length) return ""

  let fixedSentence = data.last_user_message
  const explanations: string[] = []

  const sortedIssues = [...data.issues].sort((a, b) => b.original_text.length - a.original_text.length)

  sortedIssues.forEach((issue) => {
    const { original_text, corrected_text, explanation } = issue

    const originalWords = original_text.split(/\s+/)
    const correctedWords = corrected_text.split(/\s+/)

    let highlightedText = ""
    let i = 0,
      j = 0

    while (i < originalWords.length && j < correctedWords.length) {
      if (originalWords[i].toLowerCase() === correctedWords[j].toLowerCase()) {
        highlightedText += correctedWords[j] + " "
        i++
        j++
      } else {
        highlightedText += `<span class="ea-highlight">${correctedWords[j]}</span> `
        j++
      }
    }

    while (j < correctedWords.length) {
      highlightedText += `<span class="ea-highlight">${correctedWords[j]}</span> `
      j++
    }

    const escapedOriginal = original_text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(escapedOriginal, "i")

    fixedSentence = fixedSentence.replace(regex, highlightedText.trim())

    if (!explanations.includes(explanation)) {
      explanations.push(explanation)
    }
  })

  const explanationHtml = explanations.map((explanation) => `<li>${explanation}</li>`).join("")

  return `
    <div class="ea-container" onclick="this.classList.toggle('ea-expanded')">
      <p class="ea-corrected"><b>Suggestion:</b> ${fixedSentence}</p>
      <div class="ea-explanation-block">
        <ul class="ea-explanation-list">${explanationHtml}</ul>
      </div>
    </div>
  `
}

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export const formatTagLabel = (tag: string): string => {
  return tag
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1))
    .join(" ")
}

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString()
}

export const formatDateTime = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  })
}

export const highlightWords = (text: string, words: IWord[], type: "error" | "correct") => {
  if (!words?.length) return text

  const uniqueWords = [...new Set(words.map((w) => w.value))]
  const escapedWords = uniqueWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const regex = new RegExp(`\\b(${escapedWords.join("|")})\\b`, "gi")

  return text.replace(regex, (match) => {
    const cls = type === "error" ? "text-red-600 font-semibold" : "text-green-700 font-semibold"
    return `<span class="${cls}">${match}</span>`
  })
}

export function getPartProgress(progress: Record<string, number>, promptName: string, part: SessionIeltsPartEnum | "FULL_SCENARIO"): number {
  if (part === "FULL_SCENARIO") return progress[promptName] || 0

  const key = `${promptName}#${part}`
  return progress[key] || 0
}

export function tokenizeTextToParagraphs(text: string): TokenType[][] {
  const paragraphs = text.split(/\n\s*\n/)

  return paragraphs.map((para) => {
    const tokens: TokenType[] = []
    const withLineBreaks = para.replace(/\n/g, " __NEWLINE__ ")

    withLineBreaks.split(/\s+/).forEach((chunk) => {
      if (chunk === "" || chunk === " ") return

      if (chunk === "__NEWLINE__") {
        tokens.push({ type: "newline" })
      } else {
        tokens.push({ type: "word", value: chunk })
      }
    })

    return tokens
  })
}
