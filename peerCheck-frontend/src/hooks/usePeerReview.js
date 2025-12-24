// hooks/usePeerReview.js
import { useState, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';
import { getAuthToken } from '@/utils/auth.js';

export const usePeerReview = () => {
  const [peerReviews, setPeerReviews] = useState([]);
  const [aggregatedScores, setAggregatedScores] = useState(null);
  const [userPeerScore, setUserPeerScore] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPeerReviews = useCallback(async (projectId) => {
    try {
      const token = getAuthToken();
      const response = await axiosClient.get(`/peer-review/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setPeerReviews(response.data.data);
      }
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const fetchAggregatedScores = useCallback(async (projectId) => {
    try {
      const token = getAuthToken();
      const response = await axiosClient.get(`/peer-review/aggregated/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setAggregatedScores(response.data.data);
      }
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const fetchUserPeerScore = useCallback(async (projectId) => {
    try {
      const token = getAuthToken();
      const response = await axiosClient.get(`/peer-review/my-score/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setUserPeerScore(response.data.data);
      }
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const fetchCompletionStatus = useCallback(async (projectId) => {
    try {
      const token = getAuthToken();
      const response = await axiosClient.get(`/peer-review/completion/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setCompletionStatus(response.data.data);
      }
      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const submitReview = useCallback(async (reviewData) => {
    try {
      const token = getAuthToken();
      const response = await axiosClient.post('/peer-review/submit', reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        // Refresh all data after successful submission
        await Promise.all([
          fetchAggregatedScores(reviewData.projectId),
          fetchUserPeerScore(reviewData.projectId),
          fetchCompletionStatus(reviewData.projectId)
        ]);
      }

      return response.data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchAggregatedScores, fetchUserPeerScore, fetchCompletionStatus]);

  const fetchAllPeerReviewData = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchPeerReviews(projectId),
        fetchAggregatedScores(projectId),
        fetchUserPeerScore(projectId),
        fetchCompletionStatus(projectId)
      ]);
    } catch (error) {
      console.error('Error fetching peer review data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchPeerReviews, fetchAggregatedScores, fetchUserPeerScore, fetchCompletionStatus]);

  return {
    peerReviews,
    aggregatedScores,
    userPeerScore,
    completionStatus,
    loading,
    error,
    submitReview,
    fetchAllPeerReviewData,
    fetchPeerReviews,
    fetchAggregatedScores,
    fetchUserPeerScore,
    fetchCompletionStatus
  };
};