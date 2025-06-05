# Zaviye

This is a basic web app I put together for my own use. I needed a straightforward way to run a few specific AI prompts without the performance issues I was hitting elsewhere. It's not revolutionary, just a personal tool.

## What it is

I used to rely on tools like Google AI Studio for certain custom prompts, but the lag and general overhead for my simple use cases became frustrating.

Zaviye is the result: a minimal web interface for three AI-powered tasks I use regularly. It's built to be fast and focused for these specific functions.

## The Prompts / Modes

It has three modes, each for a different task:

*   **Glitch Mode:**
    *   Takes formal text and converts it into natural, casual online speech (think Discord, Reddit). Useful for making announcements or technical notes sound more human.

*   **Blame Mode:**
    *   Helps generate professional git commit messages. You give it your `git status`, changed files, and a brief idea of the changes, and it formats a commit message following Conventional Commits standards.

*   **Reson Mode:**
    *   Provides pronunciation guides for English words or phrases using simple, standard English letter representations (no IPA). Input words in `{curly braces}` (e.g., `{onomatopoeia}`) to get a breakdown.

## Tech Stack

*   Next.js (v15) & React (v19)
*   Tailwind CSS & shadcn/ui
*   Gemini API (for the AI)
*   TypeScript

The core is really just the system prompts tailored for each mode.

## Why it exists

Simply put, I needed this for myself. The existing options were too slow or cumbersome for these specific, frequent tasks. This app solves that for me. It's a practical solution to a personal workflow issue.

## Running it

If you want to run it locally:

1.  Node.js and npm/yarn are required.
2.  Clone the repo.
3.  Install dependencies: `npm install` (or `yarn install`).
4.  Set up your Gemini API key in a `.env.local` file:
    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
5.  Run the development server: `npm run dev` (or `yarn dev`).

---

That's it. Just a personal utility.
