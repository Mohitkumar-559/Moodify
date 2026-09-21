# Moodify MVP — Phase 1 Deployment Requirements

2026-09-21 · Prepared by @Someone

## 1. Document control

| Field | Detail |
| --- | --- |
| Document type | Functional Requirements Document (FRD), incorporating a Service Level Definition (SLD) for Phase 1 |
| Version | 0.1 (Draft) |
| Status | Draft — pending review |
| Author | Mohit |
| Owner | Product / Engineering |

**Version history**

| Version | Date | Author | Summary of changes |
| --- | --- | --- | --- |
| 0.1 | 2026-09-21 | Mohit | Initial draft — Phase 1 MVP scope, resources, platform, and SLD |

**Approvals**

| Role | Name | Status | Date |
| --- | --- | --- | --- |
| Product owner | — | Pending | — |
| Tech lead | — | Pending | — |

## 2. Purpose and scope

This document defines the Phase 1 (MVP) release of Moodify, an AI-powered music app that generates playlists and, where legally licensed, downloadable tracks based on a user's stated or inferred mood. It sets the functional requirements, the Service Level Definition (SLD) the engineering team is accountable for, the technical resources required, and the target deployment platform.

Phase 1 exists to validate one core hypothesis: that mood-prompt-to-playlist generation, backed by a small licensed or connected catalog, is compelling enough to retain a niche audience — before any investment in full label licensing or platform-scale infrastructure.

Audience for this document: engineering, product, and any reviewer approving the Phase 1 budget and licensing approach.

## 3. Business requirements

**Goals for Phase 1**

- Validate mood-to-playlist generation with a real user base, not a demo
- Prove the AI mood-matching quality is good enough to retain users week over week
- Establish the licensing/catalog model before scaling spend on content rights

**Target users:** a single underserved niche (to be chosen — e.g. an indie/regional-language audience Spotify and Saavn under-serve), not a general market launch.

**Success metrics (Phase 1 exit criteria)**

| Metric | Target |
| --- | --- |
| Weekly active users (beta cohort) | 500+ |
| Playlist completion rate (song not skipped in first 30s) | ≥ 60% |
| 4-week retention | ≥ 25% |
| Mood-prompt → playlist generation success rate | ≥ 95% (no failed generations) |
| Average generation latency | < 3 seconds |

## 4. Functional requirements (Phase 1 must-haves)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Mood input via quick-select chips and free-text prompt | Must |
| FR-02 | LLM-based mood interpreter mapping prompt to audio-feature tags | Must |
| FR-03 | Recommendation engine matching tags to catalog tracks | Must |
| FR-04 | Streaming playback with queue, shuffle, repeat | Must |
| FR-05 | User accounts, auth, saved playlist library | Must |
| FR-06 | Search and browse by song/artist/mood/genre | Must |
| FR-07 | Skip/like feedback captured and fed back into the recommendation engine | Must |
| FR-08 | Offline access limited to legally licensed/owned content | Must |
| FR-09 | Cross-device sync (mobile + web) | Should |
| FR-10 | Voice-based mood input | Could (Phase 2) |
| FR-11 | Multi-platform playlist import/export | Could (Phase 2) |

## 5. Non-functional requirements — Service Level Definition (SLD)

This section defines the technical standards and performance metrics that back the Phase 1 SLA. For an internal beta, these targets also function as the team's Operational Level Agreement (OLA) until a customer-facing SLA is published.

| Attribute | Target | Measurement |
| --- | --- | --- |
| API availability | 99.5% monthly (beta tier) | Uptime monitoring on `/api/*` |
| Playlist generation latency | p95 < 3s, p99 < 6s | Server-side request timing |
| Streaming start latency | < 2s from tap to first audio frame | Client-side instrumentation |
| LLM mood-interpreter timeout | 4s hard timeout, fallback to rule-based tagging | Backend circuit breaker |
| Concurrent users supported (Phase 1) | 2,000 concurrent sessions | Load testing before launch |
| Data durability | User playlists and accounts: 99.99% (managed DB with automated backups) | Backup/restore drill quarterly |
| Incident response | P1 (full outage): 1 hr acknowledgment, 4 hr resolution target | On-call rotation |
| Recommendation freshness | Feedback loop re-indexes embeddings within 24 hrs | Batch job SLA |

## 6. Technical architecture and resources

| Layer | Resource | Notes |
| --- | --- | --- |
| Client | React (web), React Native (mobile) | Mood input, player, feedback capture |
| Backend API | FastAPI (Python) | Auth, orchestration, entitlement checks |
| Mood interpreter | LLM API (Claude/GPT), cached prompt→tag mapping | Small, cheap calls; Redis cache for repeated prompts |
| Recommendation engine | pgvector on Postgres or FAISS index | Vector similarity search over track embeddings |
| Primary database | Postgres (managed, e.g. RDS/Cloud SQL) | Users, playlists, feedback, catalog metadata |
| Cache | Redis | LLM response cache, session cache |
| Track source | Spotify/Apple Music Web API (search + playback SDK) + limited royalty-free catalog | See Section 8 — licensing gates catalog size |
| CI/CD | GitHub Actions | Test, build, deploy pipeline |
| Monitoring | Prometheus/Grafana or a managed APM (e.g. Datadog) | Tracks the SLD metrics in Section 5 |

Team resourcing for Phase 1: 1 full-stack/AI engineer (build), 1 part-time product owner, contractor/legal review for licensing (Section 8).

## 7. Deployment platform and environments

**Cloud provider:** AWS (default recommendation — mature managed Postgres/Redis, generous free-tier credits for early-stage apps; GCP/Azure are viable alternatives if the team already has credits there).

**Environments**

| Environment | Purpose | Infra |
| --- | --- | --- |
| Local | Development | Docker Compose (API, Postgres, Redis) |
| Staging | Pre-release QA, load testing | Containerized on ECS/Fargate or a single small EC2 instance |
| Production (Phase 1 beta) | Closed beta, 2,000 concurrent users | ECS/Fargate or App Runner, managed RDS Postgres, managed Redis (ElastiCache) |

**Packaging:** Docker containers for the FastAPI backend; static hosting (S3 + CloudFront or Vercel) for the web client; app store builds for mobile.

**Deployment strategy:** blue/green or rolling deploy via CI/CD, with the staging environment mirroring production config to validate the SLD targets in Section 5 before each release.

## 8. Licensing and legal constraints

Downloadable audio is a licensing question, not a technical one. Phase 1 does **not** assume full label licensing (Sony, Universal, Warner, etc.) — that is a Phase 3+ decision requiring legal negotiation and budget not yet scoped here.

**Phase 1 approach:**

- Streaming (not downloads) of catalog tracks via the Spotify/Apple Music Web API — playback happens inside that platform's own SDK, so no re-hosting or re-licensing is required
- Downloads limited strictly to royalty-free or Creative Commons tracks, or content from artists who have explicitly opted in
- No scraping, ripping, or re-hosting of any third-party copyrighted audio

This constraint must be reflected in FR-08 (Section 4) and communicated clearly to users so download expectations are accurate from day one.

## 9. Out of scope for Phase 1

- Full label licensing and unrestricted downloads
- Voice-controlled mood input
- Social/collaborative playlists
- Biometric or wearable mood detection
- Generative (AI-composed) music
- General market launch — Phase 1 targets one niche audience only

## 10. Risks and open questions

| Risk / question | Impact | Mitigation / owner |
| --- | --- | --- |
| Spotify/Apple API terms change or restrict third-party mood apps | High | Monitor developer terms quarterly; keep a fallback royalty-free catalog |
| LLM mood-mapping quality is inconsistent across prompts | Medium | Curate a prompt eval set; fall back to rule-based tagging on low confidence |
| Niche audience choice unvalidated | Medium | User interviews before Phase 1 build starts |
| Concurrent user target (2,000) untested | Low | Load test in staging before beta launch |
| Which niche audience to target first? | — | **Open — needs a decision before Section 3 is finalized** |
| Final cloud provider (AWS vs GCP) | — | **Open — depends on existing credits/tooling familiarity** |
