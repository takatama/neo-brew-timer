import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useBlocker, useNavigate, type Location } from "react-router-dom";
import { brew, useBrew } from "../brew/session";
import { formatClock, type BrewStep } from "../brew/recipe";
import type { BrewView } from "../brew/view";
import { useDisplayLanguage } from "../i18n/DisplayLanguage";
import { localizedPath, resolveRoute } from "../i18n/routing";
import { useBeans, useSettings } from "../settings/store";
import { Dial, type DialTone } from "../ui/Dial";
import { PourRail } from "../ui/PourRail";
import { MusicButton } from "../ui/MusicButton";
import { ConfirmDialog } from "../ui/Sheet";
import { CloseIcon, MuteIcon, PauseIcon, PlayIcon, ResetIcon, SoundIcon } from "../ui/icons";
import styles from "./BrewPage.module.css";

const pageOf = (location: Location) => resolveRoute(location.pathname, "", "", "en").page;
const isActive = (status: BrewView["status"]) => status === "countdown" || status === "running" || status === "paused";

const TONES: Record<BrewView["status"], DialTone> = {
  idle: "ready",
  countdown: "countdown",
  running: "brewing",
  paused: "paused",
  done: "done",
};

export function BrewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useDisplayLanguage();
  const beans = useBeans((s) => s.beans);
  const plan = useBrew((s) => s.plan);
  const view = useBrew((s) => s.view);
  const sound = useSettings((s) => s.sound);
  const toggleMute = useSettings((s) => s.toggleMute);
  const music = useSettings((s) => s.music);
  const [confirm, setConfirm] = useState<"exit" | "reset" | null>(null);

  useEffect(() => {
    brew.prepare(beans);
  }, [beans]);

  const { status, current, next, approaching } = view;
  const active = isActive(status);
  const started = status === "running" || status === "paused" || status === "done";

  // Leaving mid-brew (including the browser's Back) asks first. Read the live
  // status: ending the brew and navigating happen before the next render.
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isActive(brew.status) && pageOf(currentLocation) !== pageOf(nextLocation));
  useEffect(() => {
    if (!active) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);

  // Space starts, pauses and resumes when nothing else has focus.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || document.querySelector("dialog[open]")) return;
      const target = event.target as HTMLElement | null;
      if (target && target !== document.body && target.closest("button, input, a, [role=slider]")) return;
      event.preventDefault();
      if (brew.status === "idle") brew.start();
      else if (brew.status === "running" || brew.status === "countdown") brew.pause();
      else if (brew.status === "paused") brew.resume();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The tab title carries the target and countdown for anyone who switches away.
  useEffect(() => {
    const base = t("app.title");
    document.title = status === "running" || status === "paused"
      ? `${current.target}g · ${formatClock(view.secondsToNext)} — ${base}`
      : base;
  }, [status, current.target, view.secondsToNext, t]);
  useEffect(() => () => {
    document.title = t("app.title");
  }, [t]);

  const goHome = () => navigate(localizedPath(language, "prepare"));
  const exit = () => (active ? setConfirm("exit") : goHome());

  /* ---------- Dial content ---------- */
  const tone = TONES[status];
  const done = tone === "done";
  const showsTarget = tone === "ready" || tone === "brewing" || tone === "paused";
  let label = "";
  if (tone === "ready") label = t("brew.label.bloom");
  else if (tone === "countdown") label = t("brew.label.startingIn");
  else if (tone === "paused") label = t("brew.label.paused");
  else if (view.draining) label = t("brew.label.drain");
  else if (tone === "brewing" && current.kind === "bloom") label = t("brew.label.bloom");
  else if (tone === "brewing" && current.isLastPour) label = t("brew.label.last");
  else if (tone === "brewing") label = t("brew.label.pour", { n: current.pour });

  const toFinish = next?.kind === "finish";
  const counting = tone === "brewing" || tone === "paused";
  const caption = counting ? t(toFinish ? "brew.caption.finish" : "brew.caption.next") : undefined;
  const captionValue = counting ? formatClock(view.secondsToNext) : undefined;
  const segments = tone === "countdown" ? 5 : done ? 60 : view.windowSeconds;
  const value = tone === "countdown" ? String(view.countdownSeconds) : done ? "" : String(current.target);

  const announcement = useAnnouncement(view, t);

  const topLine = started && !done
    ? t("brew.stepOfLabel", { n: current.pour || plan.pourCount, total: plan.pourCount })
    : `${plan.beans} g → ${plan.water} g`;

  return (
    <div className={styles.page} data-status={status}>
      <header className={styles.bar}>
        <button type="button" className={styles.iconButton} onClick={exit} aria-label={t("brew.exit")}>
          <CloseIcon />
        </button>
        <p className={styles.topLine}>{topLine}</p>
        <span className={styles.barActions}>
          {music && <MusicButton />}
          <button
            type="button"
            className={styles.iconButton}
            onClick={toggleMute}
            aria-label={sound === "off" ? t("brew.unmute") : t("brew.mute")}
            aria-pressed={sound === "off"}
            data-muted={sound === "off" || undefined}
          >
            {sound === "off" ? <MuteIcon /> : <SoundIcon />}
          </button>
        </span>
      </header>

      <main className={styles.stage}>
        <div className={styles.dialArea}>
          <div className={styles.dialBox}>
            {done && <Steam />}
            <Dial
              tone={tone}
              label={label}
              value={value}
              unit={showsTarget ? "g" : undefined}
              suffix={showsTarget ? t("brew.suffix") || undefined : undefined}
              caption={caption}
              captionValue={captionValue}
              segments={segments}
              leadSegments={tone === "countdown" ? 5 : Math.min(5, segments)}
              approaching={approaching}
              getProgress={brew.progress}
              getLevel={brew.level}
              stepKey={started ? String(current.index) : "pre"}
            />
            <p className="visually-hidden" role="timer" aria-live="off">
              {tone === "countdown"
                ? t("brew.a11y.countdown", { seconds: view.countdownSeconds })
                : showsTarget ? t("brew.a11y.target", { label, amount: current.target }) : ""}
              {captionValue && ` ${t(toFinish ? "brew.a11y.finish" : "brew.a11y.next", { time: captionValue })}`}
            </p>
          </div>
        </div>

        <div className={styles.cluster}>
          {done ? (
            <section className={styles.doneCard}>
              <h1 className={styles.doneHeading}>{t("brew.done.heading")}</h1>
              <p className={styles.doneSummary}>
                {t("brew.done.summary", { beans: plan.beans, water: plan.water, time: formatClock(plan.durationSec) })}
              </p>
              <p className={styles.doneNote}>{t("brew.done.note")}</p>
            </section>
          ) : (
            <>
              <NextCard view={view} duration={plan.durationSec} />
              <div className={styles.railBox}>
                <PourRail
                  plan={plan}
                  currentIndex={started ? Math.min(current.index, plan.pourCount) : -1}
                  started={started}
                  running={status === "running"}
                  elapsedSeconds={view.elapsedSeconds}
                  getElapsedMs={brew.elapsedMs}
                  label={t("brew.a11y.progress", {
                    elapsed: formatClock(view.elapsedSeconds),
                    total: formatClock(plan.durationSec),
                  })}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <footer className={styles.controls}>
        {status === "idle" && (
          <button type="button" className={styles.primary} onClick={() => brew.start()}>
            <PlayIcon size={20} /> {t("brew.start")}
          </button>
        )}
        {status === "countdown" && (
          <button type="button" className={styles.secondary} onClick={() => brew.pause()}>
            {t("brew.cancel")}
          </button>
        )}
        {status === "running" && (
          <button type="button" className={styles.secondary} onClick={() => brew.pause()}>
            <PauseIcon size={20} /> {t("brew.pause")}
          </button>
        )}
        {status === "paused" && (
          <div className={styles.pair}>
            <button type="button" className={styles.ghost} onClick={() => setConfirm("reset")}>
              <ResetIcon size={19} /> {t("brew.reset")}
            </button>
            <button type="button" className={styles.primary} onClick={() => brew.resume()}>
              <PlayIcon size={20} /> {t("brew.resume")}
            </button>
          </div>
        )}
        {status === "done" && (
          <button type="button" className={styles.primary} onClick={goHome}>
            {t("brew.again")}
          </button>
        )}
      </footer>

      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <ConfirmDialog
        open={confirm === "exit" || blocker.state === "blocked"}
        title={t("brew.confirmExit.title")}
        body={t("brew.confirmExit.body")}
        confirmLabel={t("brew.confirmExit.confirm")}
        cancelLabel={t("brew.confirmExit.cancel")}
        onConfirm={() => {
          setConfirm(null);
          brew.reset();
          if (blocker.state === "blocked") blocker.proceed();
          else goHome();
        }}
        onCancel={() => {
          setConfirm(null);
          if (blocker.state === "blocked") blocker.reset();
        }}
      />
      <ConfirmDialog
        open={confirm === "reset"}
        title={t("brew.confirmReset.title")}
        body={t("brew.confirmReset.body")}
        confirmLabel={t("brew.confirmReset.confirm")}
        cancelLabel={t("brew.confirmReset.cancel")}
        onConfirm={() => {
          setConfirm(null);
          brew.reset();
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function NextCard({ view, duration }: { view: BrewView; duration: number }) {
  const { t } = useTranslation();
  const { status, current, next, approaching, draining } = view;
  const before = status === "idle" || status === "countdown";
  const step: BrewStep | null = before ? current : next;
  if (!step) return null;

  if (status === "idle") {
    return (
      <section className={styles.next} data-wrap aria-hidden="true">
        <span className={styles.kicker}>{t("brew.card.before")}</span>
        <span className={styles.what}>{t("prepare.tare")}</span>
        <span className={styles.meta} />
      </section>
    );
  }

  const finishing = step.kind === "finish";
  const kicker = before
    ? t("brew.card.first")
    : finishing ? t(draining ? "brew.card.next" : "brew.card.then")
    : approaching ? t("brew.card.soon") : t("brew.card.next");

  let what;
  if (finishing) what = t(draining ? "brew.card.done" : "brew.card.drain");
  else what = (
    <Trans
      i18nKey={step.kind === "bloom" ? "brew.card.bloom" : "brew.card.pourTo"}
      values={{ amount: step.target }}
      components={{ b: <b className="display" /> }}
    />
  );

  let meta = "";
  if (finishing) meta = t(draining ? "brew.card.aroundTime" : "brew.card.finishAt", { time: formatClock(duration) });
  else if (!before) meta = t("brew.card.added", { amount: step.amount });

  return (
    <section className={styles.next} data-approaching={(approaching && !before) || undefined} aria-hidden="true">
      <span className={styles.kicker}>{kicker}</span>
      <span className={styles.what}>{what}</span>
      <span className={styles.meta}>{meta}</span>
    </section>
  );
}

/** Steam that curls up from a finished cup. */
function Steam() {
  return (
    <svg className={styles.steam} viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      {[28, 60, 92].map((x, i) => (
        <path
          key={x}
          d={`M${x} 76c-9-11 9-19 0-31s9-20 0-31`}
          style={{ animationDelay: `${i * -1.1}s` }}
        />
      ))}
    </svg>
  );
}

/** Speaks step changes, the five-second heads-up, pause and completion. */
function useAnnouncement(view: BrewView, t: ReturnType<typeof useTranslation>["t"]): string {
  const [text, setText] = useState("");
  const last = useRef("");
  const { status, current, next, approaching } = view;

  let key = "";
  let message = "";
  if (status === "countdown") {
    key = "countdown";
    message = t("brew.announce.countdown", { amount: current.target });
  } else if (status === "paused") {
    key = `paused:${current.index}`;
    message = t("brew.announce.paused");
  } else if (status === "done") {
    key = "done";
    message = t("brew.announce.done");
  } else if (status === "running" && view.draining && !approaching) {
    key = "drain";
    message = t("brew.announce.drain");
  } else if (status === "running" && approaching && next) {
    key = `soon:${next.index}`;
    message = next.kind === "finish" ? t("brew.announce.soonFinish") : t("brew.announce.soon", { amount: next.target });
  } else if (status === "running") {
    key = `step:${current.index}`;
    const kind = current.kind === "bloom" ? "bloom" : current.isLastPour ? "last" : "pour";
    message = t(`brew.announce.${kind}`, { amount: current.target });
  }

  useEffect(() => {
    if (!key || key === last.current) return;
    last.current = key;
    setText(message);
  }, [key, message]);

  return text;
}
