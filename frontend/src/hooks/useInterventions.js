import { useState, useEffect, useCallback } from 'react';

// Intervention Hook for React components
export const useInterventions = (userId) => {
  const [interventions, setInterventions] = useState([]);
  const [pendingIntervention, setPendingIntervention] = useState(null);

  // Connect to intervention server via WebSocket or Server-Sent Events
  // For now, we'll use polling as a fallback, but ideally use WebSocket
  useEffect(() => {
    let eventSource;
    
    // Try to establish connection to intervention server
    const connectToInterventionServer = () => {
      // For now, we'll simulate the connection
      // In production, you'd set up WebSocket or SSE connection here
      console.log('🎯 Connected to intervention delivery system');
    };

    connectToInterventionServer();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userId]);

  // Receive intervention (called when n8n posts to frontend API)
  const receiveIntervention = useCallback((intervention) => {
    console.log('📨 Received intervention:', intervention);
    
    setInterventions(prev => [...prev, intervention]);
    setPendingIntervention(intervention);
    
    // Auto-clear pending intervention after 10 minutes if not used
    setTimeout(() => {
      setPendingIntervention(current => 
        current?.id === intervention.id ? null : current
      );
    }, 10 * 60 * 1000);
    
  }, []);

  // Get pending intervention ID for next text chat
  const getPendingInterventionId = useCallback(() => {
    return pendingIntervention?.id || null;
  }, [pendingIntervention]);

  // Mark intervention as used (called after sending with text chat)
  const markInterventionUsed = useCallback((interventionId) => {
    setPendingIntervention(current => 
      current?.id === interventionId ? null : current
    );
    
    setInterventions(prev => 
      prev.map(intervention => 
        intervention.id === interventionId 
          ? { ...intervention, status: 'used', usedAt: Date.now() }
          : intervention
      )
    );
  }, []);

  // Clear all interventions
  const clearInterventions = useCallback(() => {
    setInterventions([]);
    setPendingIntervention(null);
  }, []);

  return {
    interventions,
    pendingIntervention,
    receiveIntervention,
    getPendingInterventionId,
    markInterventionUsed,
    clearInterventions
  };
};

// Mock intervention server connection for browser environment
export const simulateInterventionDelivery = (intervention) => {
  // This would be called by the intervention server when it receives a POST
  const event = new CustomEvent('intervention-received', { 
    detail: intervention 
  });
  window.dispatchEvent(event);
};

// Enhanced useInterventions that listens to custom events
export const useInterventionsWithEvents = (userId) => {
  const {
    interventions,
    pendingIntervention,
    receiveIntervention,
    getPendingInterventionId,
    markInterventionUsed,
    clearInterventions
  } = useInterventions(userId);

  useEffect(() => {
    const handleInterventionReceived = (event) => {
      receiveIntervention(event.detail);
    };

    window.addEventListener('intervention-received', handleInterventionReceived);

    return () => {
      window.removeEventListener('intervention-received', handleInterventionReceived);
    };
  }, [receiveIntervention]);

  return {
    interventions,
    pendingIntervention,
    getPendingInterventionId,
    markInterventionUsed,
    clearInterventions
  };
};