// Secure Token Storage System
// Replaces console.log with proper data persistence

import crypto from 'crypto';

// Types for connection data
interface ConnectionData {
  user_id: string;
  email: string;
  display_name: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at: Date;
  connected_at: Date;
  scopes: string[];
  encrypted: boolean;
}

interface StoredConnection {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  encrypted_tokens: string;
  token_expires_at: string;
  connected_at: string;
  scopes: string;
  last_used: string;
  is_active: boolean;
}

// Encryption utilities
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'fallback-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';

function encryptTokens(tokens: { access_token: string; refresh_token?: string }): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  
  let encrypted = cipher.update(JSON.stringify(tokens), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  });
}

function decryptTokens(encryptedData: string): { access_token: string; refresh_token?: string } {
  const { encrypted, iv, authTag } = JSON.parse(encryptedData);
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

// Simple file-based storage for MVP (replace with database in production)
class FileConnectionStore {
  private storePath = process.env.CONNECTION_STORE_PATH || '/tmp/celesteos-connections.json';
  private connections: Map<string, StoredConnection> = new Map();

  constructor() {
    this.loadConnections();
  }

  private loadConnections(): void {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.storePath)) {
        const data = fs.readFileSync(this.storePath, 'utf8');
        const connections = JSON.parse(data);
        this.connections = new Map(Object.entries(connections));
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      this.connections = new Map();
    }
  }

  private saveConnections(): void {
    try {
      const fs = require('fs');
      const data = Object.fromEntries(this.connections);
      fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save connections:', error);
    }
  }

  public storeConnection(connectionData: ConnectionData): string {
    const connectionId = crypto.randomUUID();
    
    // Encrypt sensitive tokens
    const encryptedTokens = encryptTokens({
      access_token: connectionData.access_token,
      refresh_token: connectionData.refresh_token
    });

    const storedConnection: StoredConnection = {
      id: connectionId,
      user_id: connectionData.user_id,
      email: connectionData.email,
      display_name: connectionData.display_name,
      encrypted_tokens: encryptedTokens,
      token_expires_at: connectionData.token_expires_at.toISOString(),
      connected_at: connectionData.connected_at.toISOString(),
      scopes: connectionData.scopes.join(' '),
      last_used: new Date().toISOString(),
      is_active: true
    };

    this.connections.set(connectionId, storedConnection);
    this.saveConnections();
    
    console.log(`✅ Securely stored connection for user: ${connectionData.email}`);
    return connectionId;
  }

  public getConnection(connectionId: string): ConnectionData | null {
    const stored = this.connections.get(connectionId);
    if (!stored || !stored.is_active) {
      return null;
    }

    try {
      const tokens = decryptTokens(stored.encrypted_tokens);
      
      return {
        user_id: stored.user_id,
        email: stored.email,
        display_name: stored.display_name,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(stored.token_expires_at),
        connected_at: new Date(stored.connected_at),
        scopes: stored.scopes.split(' '),
        encrypted: true
      };
    } catch (error) {
      console.error('Failed to decrypt connection:', error);
      return null;
    }
  }

  public updateLastUsed(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.last_used = new Date().toISOString();
      this.saveConnections();
    }
  }

  public deactivateConnection(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.is_active = false;
      this.saveConnections();
      return true;
    }
    return false;
  }

  public getUserConnections(userId: string): StoredConnection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.user_id === userId && conn.is_active)
      .sort((a, b) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime());
  }

  public cleanupExpiredConnections(): number {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [id, connection] of this.connections.entries()) {
      const expiresAt = new Date(connection.token_expires_at);
      if (expiresAt < now) {
        this.connections.delete(id);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.saveConnections();
      console.log(`🧹 Cleaned up ${cleanedCount} expired connections`);
    }
    
    return cleanedCount;
  }
}

// Database-based storage for production (PostgreSQL/MySQL example)
class DatabaseConnectionStore {
  // This would implement the same interface but with proper database queries
  // Example implementation for production:
  /*
  async storeConnection(connectionData: ConnectionData): Promise<string> {
    const query = `
      INSERT INTO user_connections 
      (id, user_id, email, display_name, encrypted_tokens, token_expires_at, connected_at, scopes, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    // ... database implementation
  }
  */
}

// Export the appropriate store based on environment
export const connectionStore = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL
  ? new DatabaseConnectionStore()
  : new FileConnectionStore();

export { ConnectionData, StoredConnection };