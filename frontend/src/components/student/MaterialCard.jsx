import React from 'react';
import { useAuth } from '../../context/AuthContext'; /* solved bug:- membership */
import { Link } from 'react-router-dom';
import { FiFileText, FiImage, FiVideo, FiLock, FiDownload, FiEye } from 'react-icons/fi';
import './MaterialCard.css';

const typeIcon = { pdf: FiFileText, image: FiImage, video: FiVideo };
const typeColor = { pdf: '#ef4444', image: '#8b5cf6', video: '#f59e0b' };
const typeLabel = { pdf: 'PDF', image: 'Image', video: 'Video' };

export default function MaterialCard({ material }) {
  const Icon = typeIcon[material.fileType] || FiFileText;
  
  // const isLocked = material.accessType === 'members_only' && !material.fileUrl;

  const { isMember, isAdmin } = useAuth();
  const isLocked = material.accessType === 'members_only' && !isMember() && !isAdmin();

  return (
    <div className={`material-card ${isLocked ? 'locked' : ''}`}>
      {/* Type indicator */}
      <div className="card-header" style={{ '--type-color': typeColor[material.fileType] }}>
        <div className="type-icon">
          <Icon size={28} />
        </div>
        <div className="card-badges">
          <span className="badge" style={{
            background: `${typeColor[material.fileType]}20`,
            color: typeColor[material.fileType],
            border: `1px solid ${typeColor[material.fileType]}40`
          }}>
            {typeLabel[material.fileType]}
          </span>
          {isLocked && (
            <span className="badge badge-orange">
              <FiLock size={10} /> Premium
            </span>
          )}
          {material.accessType === 'free' && (
            <span className="badge badge-green">Free</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card-body">
        <h3 className="card-title">{material.title}</h3>
        {material.description && (
          <p className="card-desc">{material.description}</p>
        )}
        <div className="card-meta">
          <span className="meta-tag">{material.category}</span>
          {material.subject && <span className="meta-tag">{material.subject}</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <div className="card-stats">
          <span><FiEye size={12} /> {material.viewCount || 0}</span>
          {material.downloadAllowed && <span><FiDownload size={12} /> {material.downloadCount || 0}</span>}
        </div>
        {isLocked ? (
          <Link to="/membership" className="btn btn-primary btn-sm">
            <FiLock size={12} /> Unlock
          </Link>
        ) : (
          <Link to={`/materials/${material._id}`} className="btn btn-secondary btn-sm">
            View
          </Link>
        )}
      </div>
    </div>
  );
}
