export type IdentityVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'needs_correction'
  | 'verified'
  | 'rejected';

const STORAGE_PREFIX = 'bbberah:identity-verification-status:v1:';

function keyFor(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

/**
 * Prototype-only status storage.
 *
 * This module deliberately stores status metadata only. Do not put national IDs,
 * document images, selfies, access tokens, or reviewer notes in localStorage.
 * Replace this adapter with the authenticated server repository before launch.
 */
export function readDemoVerificationStatus(userId: string | null | undefined): IdentityVerificationStatus {
  if (!userId || typeof window === 'undefined') return 'unverified';

  try {
    const value = window.localStorage.getItem(keyFor(userId));
    switch (value) {
      case 'pending':
      case 'needs_correction':
      case 'verified':
      case 'rejected':
      case 'unverified':
        return value;
      default:
        return 'unverified';
    }
  } catch {
    return 'unverified';
  }
}

export function writeDemoVerificationStatus(
  userId: string | null | undefined,
  status: IdentityVerificationStatus,
): void {
  if (!userId || typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(keyFor(userId), status);
  } catch {
    // Status is a convenience for the local prototype, not a security boundary.
  }
}

/**
 * Provider boundary for a future server-backed implementation.
 * The browser must upload files only to private storage and submit references;
 * final review/status transitions must be authorized by the server.
 */
export interface IdentityVerificationRepository {
  getStatus(userId: string): Promise<IdentityVerificationStatus>;
  submitManualReview(input: {
    userId: string;
    role: 'driver' | 'shipper';
    nationalId: string;
    identityDocument: File;
    facePhoto: File;
  }): Promise<void>;
}
