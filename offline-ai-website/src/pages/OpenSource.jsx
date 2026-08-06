import { useEffect, useState } from "react";
import "./OpenSource.css";

const REPO = "KeshavKandoi/OfflineChatBot";
const REPO_URL = `https://github.com/${REPO}`;

export default function OpenSource() {
  const [repoData, setRepoData] = useState(null);
  const [languages, setLanguages] = useState(null);
  const [releases, setReleases] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [repoRes, langRes, releasesRes] = await Promise.all([
          fetch(`https://api.github.com/repos/${REPO}`),
          fetch(`https://api.github.com/repos/${REPO}/languages`),
          fetch(`https://api.github.com/repos/${REPO}/releases`),
        ]);

        if (!repoRes.ok || !langRes.ok || !releasesRes.ok) {
          throw new Error("GitHub API request failed");
        }

        const [repoJson, langJson, releasesJson] = await Promise.all([
          repoRes.json(),
          langRes.json(),
          releasesRes.json(),
        ]);

        if (cancelled) return;
        setRepoData(repoJson);
        setLanguages(langJson);
        setReleases(releasesJson.slice(0, 5));
      } catch (e) {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const languageEntries = languages ? Object.entries(languages) : [];
  const languageTotal = languageEntries.reduce((sum, [, bytes]) => sum + bytes, 0);

  return (
    <div className="nx-oss">
      <div className="nx-pipeline-header">
        <span className="nx-section-eyebrow">Open Source</span>
        <h1 className="nx-section-title">Built in the open</h1>
        <p className="nx-section-sub">
          NexaChat's full source is public on GitHub. Live stats below are
          pulled directly from the repository.
        </p>
      </div>

      {error && (
        <div className="nx-oss-error">
          Couldn't reach the GitHub API right now.{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer">View the repository directly</a>.
        </div>
      )}

      {!error && !repoData && <div className="nx-oss-loading">Loading repository data…</div>}

      {repoData && (
        <>
          <div className="nx-oss-stats">
            <div className="nx-oss-stat">
              <span className="nx-oss-stat-value">{repoData.stargazers_count}</span>
              <span className="nx-oss-stat-label">Stars</span>
            </div>
            <div className="nx-oss-stat">
              <span className="nx-oss-stat-value">{repoData.forks_count}</span>
              <span className="nx-oss-stat-label">Forks</span>
            </div>
            <div className="nx-oss-stat">
              <span className="nx-oss-stat-value">{repoData.open_issues_count}</span>
              <span className="nx-oss-stat-label">Open Issues</span>
            </div>
            <div className="nx-oss-stat">
              <span className="nx-oss-stat-value">
                {new Date(repoData.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
              <span className="nx-oss-stat-label">Last Updated</span>
            </div>
          </div>

          {languageEntries.length > 0 && (
            <div className="nx-oss-languages">
              <h3>Language distribution</h3>
              <div className="nx-oss-lang-bar">
                {languageEntries.map(([lang, bytes]) => (
                  <span
                    key={lang}
                    className="nx-oss-lang-segment"
                    style={{ width: `${(bytes / languageTotal) * 100}%` }}
                    title={`${lang}: ${((bytes / languageTotal) * 100).toFixed(1)}%`}
                  />
                ))}
              </div>
              <div className="nx-oss-lang-legend">
                {languageEntries.map(([lang, bytes]) => (
                  <span key={lang} className="nx-oss-lang-item">
                    {lang} — {((bytes / languageTotal) * 100).toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {releases && releases.length > 0 && (
            <div className="nx-oss-releases">
              <h3>Recent releases</h3>
              <ul>
                {releases.map((r) => (
                  <li key={r.id}>
                    <span className="nx-oss-release-tag">{r.tag_name}</span>
                    <span className="nx-oss-release-date">
                      {new Date(r.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <a href={REPO_URL} target="_blank" rel="noreferrer" className="nx-btn-primary nx-oss-cta">
        View on GitHub
      </a>
    </div>
  );
}
