import { useState } from 'react';
import toast from 'react-hot-toast';

export const useODRequests = () => {
  const [odRequests, setODRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitODRequest = async (requestData) => {
    try {
      setLoading(true);
const result = await dbHelpers.createODRequest(requestData);
      if (result.error) throw result.error;
      return result;

      if (error) {
        console.error('Error submitting OD request:', error);
        toast.error('Failed to submit OD request');
        return { error };
      }

      toast.success('OD request submitted successfully!');
      return { data };
    } catch (error) {
      console.error('Submit OD request error:', error);
      toast.error('Failed to submit OD request');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getODRequests = async (studentId) => {
    try {
      setLoading(true);
const result = await dbHelpers.getODRequests({ student_id: studentId });
      if (result.error) throw result.error;
      return result;

      if (error) {
        console.error('Error fetching OD requests:', error);
        return { error };
      }

      setODRequests(data);
      return { data };
    } catch (error) {
      console.error('Get OD requests error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const approveODRequest = async (requestId, teacherId) => {
    try {
      const { data, error } = await supabase
        .from('od_requests')
        .update({
          status: 'Approved',
          teacher_id: teacherId,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error approving OD request:', error);
        toast.error('Failed to approve OD request');
        return { error };
      }

      toast.success('OD request approved!');
      return { data };
    } catch (error) {
      console.error('Approve OD request error:', error);
      toast.error('Failed to approve OD request');
      return { error };
    }
  };

  return {
    odRequests,
    loading,
    submitODRequest,
    getODRequests,
    approveODRequest
  };
};