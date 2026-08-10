import { speakZh } from "@/ui/speech";
import {
  customAssignmentId,
  parseHomeworkRows,
  validateAssignment,
  type HomeworkAssignment,
  type ValidationIssue,
} from "./model";
import {
  estimatedMissionMinutes,
  gardenStageForMissions,
  MISSION_ITEM_LIMIT,
  planMissionItems,
} from "./mission";
import { HomeworkProgressStore } from "./progress";
import { HomeworkRepository, recommendedAssignment } from "./repository";
import {
  advanceHomeworkSession,
  currentSessionItemId,
  gradeHomeworkRecall,
  phaseLabel,
  startHomeworkSession,
  type HomeworkSession,
} from "./session";

type HomeworkScreen = "home" | "session" | "author";

const MISSION_GARDEN_ART = `${import.meta.env.BASE_URL}art/mission-garden-v1.webp`;

export interface HomeworkAppOptions {
  onFreePlay: () => void;
  repository?: HomeworkRepository;
  progress?: HomeworkProgressStore;
  now?: () => Date;
}

interface AuthorValues {
  title: string;
  startDate: string;
  dueDate: string;
  rows: string;
  editingId: string | null;
}

export class HomeworkApp {
  private readonly repository: HomeworkRepository;
  private readonly progress: HomeworkProgressStore;
  private readonly now: () => Date;
  private screen: HomeworkScreen = "home";
  private selectedAssignmentId: string | null = null;
  private session: HomeworkSession | null = null;
  private answerRevealed = false;
  private authorIssues: ValidationIssue[] = [];
  private authorPreview: HomeworkAssignment | null = null;
  private authorValues: AuthorValues;

  constructor(
    private readonly root: HTMLElement,
    private readonly options: HomeworkAppOptions,
  ) {
    this.repository = options.repository ?? new HomeworkRepository();
    this.progress = options.progress ?? new HomeworkProgressStore();
    this.now = options.now ?? (() => new Date());
    const today = localIso(this.now());
    this.authorValues = {
      title: "",
      startDate: today,
      dueDate: today,
      rows: "",
      editingId: null,
    };
    this.root.addEventListener("click", this.onClick);
    this.root.addEventListener("change", this.onChange);
    this.root.addEventListener("submit", this.onSubmit);
  }

  render(): void {
    if (this.screen === "author") {
      this.root.innerHTML = this.renderAuthor();
      return;
    }
    if (this.screen === "session" && this.session) {
      this.root.innerHTML = this.renderSession();
      return;
    }
    this.screen = "home";
    this.root.innerHTML = this.renderHome();
  }

  dispose(): void {
    this.root.removeEventListener("click", this.onClick);
    this.root.removeEventListener("change", this.onChange);
    this.root.removeEventListener("submit", this.onSubmit);
  }

  private assignments(): HomeworkAssignment[] {
    return this.repository.list();
  }

  private selectedAssignment(): HomeworkAssignment | null {
    const assignments = this.assignments();
    const chosen = this.selectedAssignmentId
      ? assignments.find((assignment) => assignment.id === this.selectedAssignmentId)
      : null;
    const fallback = recommendedAssignment(assignments, localIso(this.now()));
    const selected = chosen ?? fallback;
    this.selectedAssignmentId = selected?.id ?? null;
    return selected;
  }

  private renderHeader(active: "homework" | "author"): string {
    return `
      <header class="homework-header">
        <div>
          <h1>Magical Kitty Mandarin</h1>
          <p>Small steps, strong characters.</p>
        </div>
        <div class="homework-header-mark" aria-hidden="true">🐱</div>
      </header>
      <nav class="app-nav" aria-label="Main navigation">
        <button class="app-nav-btn ${active === "homework" ? "app-nav-btn--active" : ""}"
                data-action="home" type="button">📚 Homework</button>
        <button class="app-nav-btn" data-action="free-play" type="button">🎮 Free Play</button>
        <button class="app-nav-btn ${active === "author" ? "app-nav-btn--active" : ""}"
                data-action="author" type="button">⚙️ Manage</button>
      </nav>`;
  }

  private renderHome(): string {
    const assignments = this.assignments();
    const assignment = this.selectedAssignment();
    const savedSession = this.progress.loadSession();
    if (!assignment) {
      return `${this.renderHeader("homework")}
        <section class="homework-empty">
          <h2>No homework yet</h2>
          <p>Create a week in Manage Homework.</p>
          <button class="primary-action" data-action="author" type="button">Create homework</button>
        </section>`;
    }

    const assignmentProgress = this.progress.getAssignment(assignment.id);
    const practiced = assignment.items.filter((item) => {
      const itemProgress = assignmentProgress.items[item.id];
      return Boolean(itemProgress?.learned || itemProgress?.writingPractices || itemProgress?.recallCorrect);
    }).length;
    const isComplete = Boolean(assignmentProgress.completedAt);
    const canResume = Boolean(savedSession && sessionMatchesAssignment(savedSession, assignment));
    const plannedItems = canResume
      ? assignment.items.filter((item) => savedSession!.missionItemIds.includes(item.id))
      : planMissionItems(assignment, assignmentProgress);
    const garden = gardenStageForMissions(this.progress.getTotalMissionsCompleted());
    const status = isComplete
      ? "Weekly homework complete"
      : practiced > 0
        ? `${practiced}/${assignment.items.length} characters growing stronger`
        : "Ready for the first mission";
    const chips = plannedItems.map((item) =>
      `<li title="${escapeAttr(item.pinyin)} — ${escapeAttr(item.english)}">
        <span lang="zh-Hant">${escapeHtml(item.hanzi)}</span>
      </li>`,
    ).join("");
    const missionMinutes = estimatedMissionMinutes(plannedItems.length);

    return `${this.renderHeader("homework")}
      <main class="homework-main">
        <section class="assignment-picker" aria-label="Homework week">
          <label for="homework-assignment">Homework week</label>
          <select id="homework-assignment" data-homework-assignment>
            ${assignments.map((item) => `
              <option value="${escapeAttr(item.id)}"${item.id === assignment.id ? " selected" : ""}>
                ${escapeHtml(shortDate(item.startDate))} · ${escapeHtml(item.title)}${item.source === "custom" ? " ★" : ""}
              </option>`).join("")}
          </select>
        </section>

        <section class="assignment-hero mission-hero" data-testid="assignment-card">
          <img class="mission-hero-art" src="${escapeAttr(MISSION_GARDEN_ART)}" alt="" />
          <div class="mission-hero-shade" aria-hidden="true"></div>
          <div class="assignment-copy mission-hero-copy">
            <div class="assignment-eyebrow">Next ${missionMinutes}-minute mission</div>
            <h2>${canResume ? "Your kitty is waiting" : garden.name}</h2>
            <div class="mission-assignment-label">${escapeHtml(assignment.title)} · ${escapeHtml(formatDateRange(assignment.startDate, assignment.dueDate))}</div>
            <p>${escapeHtml(garden.message)}</p>
            <ul class="mission-focus" aria-label="Mission characters">${chips}</ul>
            <div class="assignment-status ${isComplete ? "assignment-status--complete" : ""}">
              ${garden.icon} ${escapeHtml(status)}
            </div>
            <button class="primary-action primary-action--large mission-start" data-action="start-session" type="button">
              ${canResume ? "Continue mission" : "Start mission"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section class="assignment-content" aria-labelledby="characters-title">
          <div class="section-heading">
            <div>
              <div class="section-kicker">Weekly homework</div>
              <h2 id="characters-title">${assignment.items.length} characters & words</h2>
            </div>
            <span class="session-length">${assignmentProgress.missionsCompleted} missions finished</span>
          </div>
          <div class="garden-progress" aria-label="Garden progress, stage ${garden.stage + 1} of 6">
            ${Array.from({ length: 6 }, (_, index) => `<span class="${index <= garden.stage ? "garden-progress--grown" : ""}"></span>`).join("")}
          </div>
          <ol class="homework-path" aria-label="Homework steps">
            <li><span>1</span><strong>Learn</strong><small>See and hear</small></li>
            <li><span>2</span><strong>Write</strong><small>Practice on paper</small></li>
            <li><span>3</span><strong>Remember</strong><small>Try without peeking</small></li>
            <li><span>4</span><strong>Review</strong><small>Fix missed words</small></li>
          </ol>
        </section>
      </main>`;
  }

  private renderSession(): string {
    const session = this.session!;
    const assignment = this.repository.find(session.assignmentId);
    if (!assignment) {
      this.screen = "home";
      this.session = null;
      return this.renderHome();
    }
    if (session.phase === "complete") return this.renderSummary(assignment, session);

    const itemId = currentSessionItemId(session);
    const item = assignment.items.find((candidate) => candidate.id === itemId);
    if (!item) return this.renderSummary(assignment, session);
    const pct = session.queue.length === 0
      ? 100
      : Math.round(((session.position + 1) / session.queue.length) * 100);
    const stepNumber = session.phase === "learn" ? 1 : session.phase === "practice" ? 2 : session.phase === "recall" ? 3 : 4;

    return `<main class="session-shell">
      <header class="session-header">
        <button class="icon-button" data-action="back-home" type="button" aria-label="Back to homework">←</button>
        <div class="session-heading">
          <div>Step ${stepNumber} of 4</div>
          <strong>${phaseLabel(session.phase)}</strong>
        </div>
        <div class="session-counter">${session.position + 1}/${session.queue.length}</div>
      </header>
      <div class="session-progress" role="progressbar" aria-label="Step progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
        <div style="width:${pct}%"></div>
      </div>
      ${this.renderSessionCard(session, item)}
    </main>`;
  }

  private renderSessionCard(
    session: HomeworkSession,
    item: HomeworkAssignment["items"][number],
  ): string {
    if (session.phase === "learn") {
      return `<section class="study-card study-card--learn" data-testid="study-card" tabindex="-1">
        <div class="study-prompt">Look, listen, and say it aloud</div>
        ${characterFace(item.hanzi, item.pinyin, item.english)}
        <button class="listen-action" data-action="listen" data-hanzi="${escapeAttr(item.hanzi)}" type="button">🔊 Listen</button>
        <button class="primary-action primary-action--large" data-action="advance-session" type="button">I learned it <span>→</span></button>
      </section>`;
    }
    if (session.phase === "practice") {
      return `<section class="study-card study-card--practice" data-testid="study-card" tabindex="-1">
        <div class="study-prompt">Write it three times on paper</div>
        ${characterFace(item.hanzi, item.pinyin, item.english)}
        <div class="paper-guide" aria-hidden="true">
          <span>${escapeHtml(item.hanzi)}</span><span>${escapeHtml(item.hanzi)}</span><span>${escapeHtml(item.hanzi)}</span>
        </div>
        <p class="study-tip">Say the word each time you write it.</p>
        <button class="primary-action primary-action--large" data-action="advance-session" type="button">Done writing <span>→</span></button>
      </section>`;
    }

    const revealed = this.answerRevealed;
    return `<section class="study-card study-card--recall" data-testid="study-card" tabindex="-1">
      <div class="study-prompt">${session.phase === "review" ? "Try this one again" : "Write the answer without peeking"}</div>
      <div class="recall-clue">
        <div class="recall-meaning">${escapeHtml(item.english)}</div>
        <div class="recall-pinyin">${escapeHtml(item.pinyin)}</div>
        <button class="listen-action" data-action="listen" data-hanzi="${escapeAttr(item.hanzi)}" type="button">🔊 Hear it</button>
      </div>
      ${revealed
        ? `<div class="answer-reveal" aria-live="polite" tabindex="-1">
            <div class="answer-label">Answer</div>
            <div class="study-hanzi" lang="zh-Hant">${escapeHtml(item.hanzi)}</div>
            <p>Does your writing match?</p>
          </div>
          <div class="grade-actions">
            <button class="grade-action grade-action--again" data-action="grade" data-correct="false" type="button">Practice again</button>
            <button class="grade-action grade-action--correct" data-action="grade" data-correct="true" type="button">I got it ✓</button>
          </div>`
        : `<div class="recall-writing-space" aria-hidden="true"><span></span><span></span><span></span></div>
          <button class="primary-action primary-action--large" data-action="reveal-answer" type="button">Show answer</button>`}
    </section>`;
  }

  private renderSummary(assignment: HomeworkAssignment, session: HomeworkSession): string {
    const needsWork = new Set(session.needsWork);
    const missionItems = assignment.items.filter((item) => session.missionItemIds.includes(item.id));
    const mastered = missionItems.length - needsWork.size;
    const assignmentProgress = this.progress.getAssignment(assignment.id);
    const garden = gardenStageForMissions(this.progress.getTotalMissionsCompleted());
    const weekComplete = Boolean(assignmentProgress.completedAt);
    return `<main class="session-shell session-shell--summary">
      <section class="summary-card" data-testid="session-summary" tabindex="-1">
        <div class="summary-garden" aria-hidden="true"><span>${garden.icon}</span></div>
        <div class="section-kicker">Mission complete</div>
        <h1>${escapeHtml(garden.name)}</h1>
        <p>${escapeHtml(garden.message)}</p>
        <div class="summary-stats">
          <div><strong>${mastered}</strong><span>Looking strong</span></div>
          <div><strong>${needsWork.size}</strong><span>Keep practicing</span></div>
        </div>
        ${needsWork.size > 0
          ? `<div class="needs-work"><strong>Practice next time:</strong>
              <div>${assignment.items.filter((item) => needsWork.has(item.id)).map((item) => `<span lang="zh-Hant">${escapeHtml(item.hanzi)}</span>`).join("")}</div>
            </div>`
            : `<div class="all-mastered">✦ You remembered every answer!</div>`}
        ${weekComplete ? `<div class="week-complete">Weekly homework complete — beautiful work!</div>` : ""}
        <button class="primary-action primary-action--large" data-action="finish-session" type="button">See my garden</button>
        <button class="secondary-action" data-action="restart-session" type="button">Play another mission</button>
      </section>
    </main>`;
  }

  private renderAuthor(): string {
    const custom = this.assignments().filter((assignment) => assignment.source === "custom");
    const issues = this.authorIssues.length > 0
      ? `<div class="author-errors" role="alert" tabindex="-1"><strong>Please fix:</strong><ul>${this.authorIssues.map((issue) => `<li>${escapeHtml(issue.message)}</li>`).join("")}</ul></div>`
      : "";
    const preview = this.authorPreview
      ? `<section class="author-preview" data-testid="author-preview">
          <div class="section-kicker">Preview</div>
          <h3>${escapeHtml(this.authorPreview.title)}</h3>
          <p>${escapeHtml(formatDateRange(this.authorPreview.startDate, this.authorPreview.dueDate))}</p>
          <ul class="character-preview">${this.authorPreview.items.map((item) => `<li><span lang="zh-Hant">${escapeHtml(item.hanzi)}</span><small>${escapeHtml(item.pinyin)}</small></li>`).join("")}</ul>
        </section>`
      : "";

    return `${this.renderHeader("author")}
      <main class="author-main">
        <section class="author-intro">
          <div>
            <div class="section-kicker">Parent tools</div>
            <h2>Manage homework</h2>
            <p>Paste a weekly list, check it, and make it available immediately on this device.</p>
          </div>
          <button class="secondary-action" data-action="new-assignment" type="button">＋ New week</button>
        </section>

        <section class="author-panel">
          <h3>${this.authorValues.editingId ? "Edit assignment" : "Add an assignment"}</h3>
          ${issues}
          <form data-author-form novalidate>
            <label>Title
              <input data-author-title required value="${escapeAttr(this.authorValues.title)}" placeholder="Week 1 dictation" />
            </label>
            <div class="author-date-row">
              <label>Starts
                <input data-author-start type="date" required value="${escapeAttr(this.authorValues.startDate)}" />
              </label>
              <label>Due
                <input data-author-due type="date" required value="${escapeAttr(this.authorValues.dueDate)}" />
              </label>
            </div>
            <label>Characters and words
              <span class="field-help">One per line: Hanzi | pinyin | English</span>
              <textarea data-author-rows rows="8" placeholder="我 | wǒ | I&#10;你 | nǐ | you">${escapeHtml(this.authorValues.rows)}</textarea>
            </label>
            <div class="author-actions">
              <button class="secondary-action" data-action="preview-assignment" type="button">Preview & validate</button>
              <button class="primary-action" data-action="save-assignment" type="submit">Save homework</button>
            </div>
          </form>
        </section>
        ${preview}

        <section class="saved-assignments">
          <div class="section-heading"><div><div class="section-kicker">On this device</div><h2>Saved weeks</h2></div></div>
          ${custom.length === 0
            ? `<p class="empty-copy">No custom weeks yet. Built-in class assignments remain available in Homework.</p>`
            : `<ul>${custom.map((assignment) => `
                <li>
                  <div><strong>${escapeHtml(assignment.title)}</strong><span>${escapeHtml(shortDate(assignment.startDate))} · ${assignment.items.length} items</span></div>
                  <div>
                    <button data-action="edit-assignment" data-id="${escapeAttr(assignment.id)}" type="button">Edit</button>
                    <button data-action="delete-assignment" data-id="${escapeAttr(assignment.id)}" type="button">Delete</button>
                  </div>
                </li>`).join("")}</ul>`}
        </section>
        <aside class="device-note">
          <strong>Device-only storage</strong>
          <p>Custom homework is saved in this browser. Cross-device publishing will require a sync service.</p>
        </aside>
      </main>`;
  }

  private readonly onClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "free-play") {
      this.options.onFreePlay();
      return;
    }
    if (action === "home") {
      this.screen = "home";
      this.render();
      return;
    }
    if (action === "author") {
      this.screen = "author";
      this.render();
      return;
    }
    if (action === "start-session" || action === "restart-session") {
      this.beginSession(action === "restart-session");
      return;
    }
    if (action === "back-home") {
      if (this.session) this.progress.saveSession(this.session);
      this.screen = "home";
      this.render();
      return;
    }
    if (action === "listen") {
      speakZh(button.dataset.hanzi ?? "");
      return;
    }
    if (action === "advance-session") {
      this.advanceSession();
      return;
    }
    if (action === "reveal-answer") {
      this.answerRevealed = true;
      this.render();
      this.root.querySelector<HTMLElement>(".answer-reveal")?.focus();
      return;
    }
    if (action === "grade") {
      this.gradeRecall(button.dataset.correct === "true");
      return;
    }
    if (action === "finish-session") {
      this.session = null;
      this.screen = "home";
      this.render();
      return;
    }
    if (action === "preview-assignment") {
      this.readAuthorForm(false);
      return;
    }
    if (action === "new-assignment") {
      const today = localIso(this.now());
      this.authorValues = { title: "", startDate: today, dueDate: today, rows: "", editingId: null };
      this.authorIssues = [];
      this.authorPreview = null;
      this.render();
      return;
    }
    if (action === "edit-assignment") {
      this.editAssignment(button.dataset.id ?? "");
      return;
    }
    if (action === "delete-assignment") {
      const id = button.dataset.id ?? "";
      if (id && window.confirm("Delete this custom homework week?")) {
        try {
          this.repository.deleteCustom(id);
          if (this.selectedAssignmentId === id) this.selectedAssignmentId = null;
          this.authorIssues = [];
        } catch (error) {
          this.authorIssues = [{ path: "storage", message: errorMessage(error) }];
        }
        this.render();
        this.focusAuthorError();
      }
    }
  };

  private readonly onChange = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement) || !target.matches("[data-homework-assignment]")) return;
    this.selectedAssignmentId = target.value;
    this.render();
  };

  private readonly onSubmit = (event: SubmitEvent): void => {
    const target = event.target;
    if (!(target instanceof HTMLFormElement) || !target.matches("[data-author-form]")) return;
    event.preventDefault();
    this.readAuthorForm(true);
  };

  private beginSession(forceNew: boolean): void {
    const assignment = this.selectedAssignment();
    if (!assignment) return;
    const saved = this.progress.loadSession();
    const missionItems = planMissionItems(assignment, this.progress.getAssignment(assignment.id));
    this.session = !forceNew && saved && sessionMatchesAssignment(saved, assignment)
      ? saved
      : startHomeworkSession(assignment, missionItems.map((item) => item.id));
    this.progress.saveSession(this.session);
    this.answerRevealed = false;
    this.screen = "session";
    this.render();
    this.focusSessionSurface();
  }

  private advanceSession(): void {
    if (!this.session) return;
    const assignment = this.repository.find(this.session.assignmentId);
    const itemId = currentSessionItemId(this.session);
    if (!assignment || !itemId) return;
    if (this.session.phase === "learn") this.progress.recordLearned(assignment.id, itemId, this.now());
    if (this.session.phase === "practice") this.progress.recordWriting(assignment.id, itemId, this.now());
    this.session = advanceHomeworkSession(this.session, assignment);
    this.persistSession(assignment);
    this.answerRevealed = false;
    this.render();
    this.focusSessionSurface();
  }

  private gradeRecall(correct: boolean): void {
    if (!this.session) return;
    const assignment = this.repository.find(this.session.assignmentId);
    const itemId = currentSessionItemId(this.session);
    if (!assignment || !itemId) return;
    this.progress.recordRecall(assignment.id, itemId, correct, this.now());
    this.session = gradeHomeworkRecall(this.session, assignment, correct);
    this.persistSession(assignment);
    this.answerRevealed = false;
    this.render();
    this.focusSessionSurface();
  }

  private persistSession(assignment: HomeworkAssignment): void {
    if (!this.session) return;
    if (this.session.phase === "complete") this.progress.completeMission(assignment, this.now());
    else this.progress.saveSession(this.session);
  }

  private readAuthorForm(save: boolean): void {
    const title = this.root.querySelector<HTMLInputElement>("[data-author-title]")?.value.trim() ?? "";
    const startDate = this.root.querySelector<HTMLInputElement>("[data-author-start]")?.value ?? "";
    const dueDate = this.root.querySelector<HTMLInputElement>("[data-author-due]")?.value ?? "";
    const rows = this.root.querySelector<HTMLTextAreaElement>("[data-author-rows]")?.value ?? "";
    this.authorValues = { ...this.authorValues, title, startDate, dueDate, rows };
    const parsed = parseHomeworkRows(rows);
    const assignment: HomeworkAssignment = {
      id: this.authorValues.editingId ?? customAssignmentId(startDate, title),
      title,
      startDate,
      dueDate,
      items: parsed.items,
      source: "custom",
    };
    this.authorIssues = [...parsed.issues, ...validateAssignment(assignment)];
    this.authorPreview = this.authorIssues.length === 0 ? assignment : null;
    if (save && this.authorIssues.length === 0) {
      try {
        this.repository.saveCustom(assignment);
        this.selectedAssignmentId = assignment.id;
        this.authorValues.editingId = assignment.id;
        this.screen = "home";
      } catch (error) {
        this.authorIssues = [{ path: "storage", message: errorMessage(error) }];
      }
    }
    this.render();
    this.focusAuthorError();
  }

  private editAssignment(id: string): void {
    const assignment = this.repository.find(id);
    if (!assignment || assignment.source !== "custom") return;
    this.authorValues = {
      title: assignment.title,
      startDate: assignment.startDate,
      dueDate: assignment.dueDate,
      rows: assignment.items.map((item) => `${item.hanzi} | ${item.pinyin} | ${item.english}`).join("\n"),
      editingId: assignment.id,
    };
    this.authorIssues = [];
    this.authorPreview = assignment;
    this.render();
  }

  private focusSessionSurface(): void {
    this.root.querySelector<HTMLElement>(".study-card, .summary-card")?.focus({ preventScroll: true });
  }

  private focusAuthorError(): void {
    this.root.querySelector<HTMLElement>(".author-errors")?.focus({ preventScroll: true });
  }
}

function sessionMatchesAssignment(session: HomeworkSession, assignment: HomeworkAssignment): boolean {
  if (session.assignmentId !== assignment.id || session.phase === "complete") return false;
  const ids = new Set(assignment.items.map((item) => item.id));
  const referencedIds = [
    ...session.missionItemIds,
    ...session.queue,
    ...session.missed,
    ...session.needsWork,
    ...Object.keys(session.reviewAttempts),
  ];
  return session.missionItemIds.length > 0 &&
    session.missionItemIds.length <= MISSION_ITEM_LIMIT &&
    session.position < session.queue.length &&
    referencedIds.every((id) => ids.has(id));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Homework could not be saved on this device.";
}

function characterFace(hanzi: string, pinyin: string, english: string): string {
  return `<div class="character-face">
    <div class="study-hanzi" lang="zh-Hant">${escapeHtml(hanzi)}</div>
    <div class="study-pinyin">${escapeHtml(pinyin)}</div>
    <div class="study-english">${escapeHtml(english)}</div>
  </div>`;
}

function localIso(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shortDate(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]} ${day}`;
}

function formatDateRange(start: string, due: string): string {
  return start === due ? shortDate(start) : `${shortDate(start)}–${shortDate(due)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}
