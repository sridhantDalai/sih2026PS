import { useEffect, useRef, useMemo } from 'react';
import { parseDescription } from '../utils/parseDescription';

/**
 * Renders structured blocks from parseDescription.
 * Groups consecutive bullet-sentence items into semantic <ul><li> blocks.
 * Renders sub-heading-lead as <h5>.
 * Preserves 100% of the exact original words without adding, changing, or deleting anything.
 */
function renderBlocks(blocks) {
  if (!blocks || blocks.length === 0) return null;

  const rendered = [];
  let currentBulletList = [];

  const flushBullets = (key) => {
    if (currentBulletList.length > 0) {
      rendered.push(
        <ul key={`bullet-list-${key}`} className="modal-bullet-list">
          {currentBulletList.map((item, i) => (
            <li key={i} className="modal-bullet-item">
              {item.text}
            </li>
          ))}
        </ul>
      );
      currentBulletList = [];
    }
  };

  blocks.forEach((block, idx) => {
    if (block.type === 'bullet-sentence') {
      currentBulletList.push(block);
    } else {
      flushBullets(idx);

      if (block.type === 'sub-heading-lead') {
        rendered.push(
          <h5 key={idx} className="modal-subheading-lead">
            {block.text}
          </h5>
        );
      } else if (block.type === 'list-item') {
        const colonMatch = block.text.match(/^((?:\d+\.|\b[A-F]\.|o|[•-])\s+[^:]{2,70}:)(.*)$/s);
        if (colonMatch) {
          rendered.push(
            <div key={idx} className={`modal-desc-item modal-item-${block.listType}`}>
              <strong className="modal-item-lead">{colonMatch[1]}</strong>
              <span>{colonMatch[2]}</span>
            </div>
          );
        } else if (block.listType === 'bullet-o') {
          const matchO = block.text.match(/^o\s*(.*)$/s);
          rendered.push(
            <div key={idx} className="modal-desc-item modal-item-bullet-o">
              <span className="bullet-o-marker">o</span>
              <span>{matchO ? matchO[1] : block.text}</span>
            </div>
          );
        } else {
          rendered.push(
            <div key={idx} className={`modal-desc-item modal-item-${block.listType}`}>
              {block.text}
            </div>
          );
        }
      } else {
        rendered.push(
          <p key={idx} className="modal-desc-paragraph">
            {block.text}
          </p>
        );
      }
    }
  });

  flushBullets('end');
  return rendered;
}

export default function PSModal({ ps, onClose }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Reset modal body scroll position to top
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, ps]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const parsed = useMemo(() => {
    return parseDescription(ps?.description || '');
  }, [ps?.description]);

  if (!ps) return null;

  const categoryClass = (ps.category || '').toLowerCase();

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${ps.psNumber}`}
    >
      <div className="modal-content" ref={contentRef}>
        <div className="modal-header">
          <div className="modal-badges">
            <span className="ps-id-badge">{ps.psNumber}</span>
            <span className={`ps-category-badge ${categoryClass}`}>{ps.category}</span>
            <span className="ps-card-theme">{ps.theme}</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
          <h2 className="modal-title">{ps.title}</h2>
        </div>

        <div className="modal-body" ref={bodyRef}>
          {/* Organization & Key Details Card */}
          {(ps.organization || ps.department || ps.submittedIdeasCount || ps.deadline) && (
            <div className="modal-org-card">
              <div className="modal-org-main">
                <div className="modal-org-info">
                  <span className="modal-org-label">ORGANIZATION / MINISTRY</span>
                  <h4 className="modal-org-name">{ps.organization || 'Government of India'}</h4>
                  {ps.department && ps.department !== ps.organization && (
                    <p className="modal-org-dept">{ps.department}</p>
                  )}
                </div>
              </div>

              {(ps.submittedIdeasCount || ps.deadline) && (
                <div className="modal-org-footer">
                  {ps.submittedIdeasCount && (
                    <div className="modal-org-pill">
                      <span className="modal-pill-icon">💡</span>
                      <span className="modal-pill-text"><strong>Submitted:</strong> {ps.submittedIdeasCount}</span>
                    </div>
                  )}
                  {ps.deadline && (
                    <div className="modal-org-pill">
                      <span className="modal-pill-icon">⏳</span>
                      <span className="modal-pill-text"><strong>Deadline:</strong> {ps.deadline}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <h3 className="modal-description-heading">Description</h3>

          {parsed.preamble && (
            <div className="modal-preamble-badge" title="Original Preamble">
              {parsed.preamble}
            </div>
          )}

          <div className="modal-description-content">
            {parsed.sections.length === 0 ? (
              <p className="modal-desc-paragraph">No description available.</p>
            ) : (
              parsed.sections.map((section, sIdx) => (
                <div key={sIdx} className="modal-desc-section">
                  {section.heading && (
                    <h4 className="modal-section-title">
                      <span className="modal-section-tag">§</span>
                      {section.heading}
                    </h4>
                  )}
                  <div className="modal-section-blocks">
                    {renderBlocks(section.blocks)}
                  </div>
                </div>
              ))
            )}
          </div>

          {(ps.youtubeLink || ps.datasetLink) && (
            <div className="modal-links">
              {ps.youtubeLink && (
                <a href={ps.youtubeLink} target="_blank" rel="noopener noreferrer" className="modal-link">
                  📹 YouTube
                </a>
              )}
              {ps.datasetLink && (
                <a href={ps.datasetLink} target="_blank" rel="noopener noreferrer" className="modal-link">
                  📊 Dataset
                </a>
              )}
            </div>
          )}

          {/* Bottom spacer for clean breathing room when scrolled to end */}
          <div className="modal-bottom-spacer" />
        </div>
      </div>
    </div>
  );
}
