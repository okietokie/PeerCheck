import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tooltip,
  Chip,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  lighten
} from "@mui/material";
import {
  ExpandMore,
  Groups,
  Person,
  Grade,
  Comment as CommentIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MilitaryTech,
  WorkspacePremium,
  TrendingUp,
  Task,
  Schedule,
  GroupWork,
  Description,
  Code,
  ThumbUp,
  ThumbDown
} from "@mui/icons-material";
import axiosClient from "@/api/axiosClient";

const MemberEvaluationSummary = ({ projectId, theme }) => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedMember, setExpandedMember] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get(
        `/projects/${projectId}/member-evaluation-summary`
      );
      if (response?.data?.success) {
        setSummary(response.data.summary);
      } else {
        setError(response?.data?.error || "Failed to fetch summary");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchSummary();
  }, [projectId]);

  const toggleExpand = (memberId) => {
    setExpandedMember(expandedMember === memberId ? null : memberId);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "success";
    if (score >= 6) return "warning";
    return "error";
  };

  const getRankIcon = (index) => {
    if (index === 0) return <MilitaryTech sx={{ color: "#FFD700", fontSize: 28 }} />;
    if (index === 1) return <MilitaryTech sx={{ color: "#C0C0C0", fontSize: 28 }} />;
    if (index === 2) return <MilitaryTech sx={{ color: "#CD7F32", fontSize: 28 }} />;
    return <Typography variant="h6" color="text.secondary">{index + 1}</Typography>;
  };

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'technical execution':
        return <Code fontSize="small" />;
      case 'task validity':
        return <Task fontSize="small" />;
      case 'time authenticity':
        return <Schedule fontSize="small" />;
      case 'teamwork':
        return <GroupWork fontSize="small" />;
      case 'documentation quality':
        return <Description fontSize="small" />;
      default:
        return <Grade fontSize="small" />;
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4} p={4}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!summary.length)
    return (
      <Box mt={4}>
        <Alert severity="info">No member evaluations found for this project.</Alert>
      </Box>
    );

  return (
    <Box mt={3}>
      {/* Summary Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, mr: 2 }}>
              <Groups />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom>
                Team Performance Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.length} team member{summary.length !== 1 ? "s" : ""} • 
                Combined project and peer evaluations
              </Typography>
            </Box>
            <Tooltip title="Top performer">
              <Chip
                icon={<TrendingUp />}
                label={`${summary[0]?.member?.name || "N/A"} (${summary[0]?.finalScore?.toFixed(1) || "0"}/10)`}
                color="primary"
                variant="outlined"
              />
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Box display="flex" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
        {summary.slice(0, 3).map((member, index) => (
          <Card 
            key={member.member._id}
            sx={{ 
              flex: '1 1 300px',
              minWidth: 280,
              maxWidth: 400,
              borderLeft: 4,
              borderColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ mr: 2 }}>
                  {getRankIcon(index)}
                </Box>
                <Avatar
                  src={member.member.avatar}
                  sx={{ width: 48, height: 48, mr: 2 }}
                >
                  {member.member.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {member.member.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rank #{index + 1}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">Overall Score</Typography>
                  <Typography 
                    variant="h6" 
                    color={`${getScoreColor(member.finalScore)}.main`}
                    fontWeight="bold"
                  >
                    {member.finalScore.toFixed(1)}/10
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={member.finalScore * 10}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'action.disabledBackground',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: `${getScoreColor(member.finalScore)}.main`
                    }
                  }}
                />
              </Box>

              <Box display="flex" sx={{ mt: 2 }}>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
                    <Grade fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" fontWeight="bold">
                      {member.totalProjectEvaluations}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Project Evals
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
                    <Person fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" fontWeight="bold">
                      {member.totalPeerReviews}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Peer Reviews
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 0.5 }}>
                    <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" fontWeight="bold">
                      {member.totalProjectComments || 0}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Comments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Detailed Table View */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Team Performance Analysis
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell><strong>Rank</strong></TableCell>
                  <TableCell><strong>Team Member</strong></TableCell>
                  <TableCell align="center"><strong>Overall Score</strong></TableCell>
                  <TableCell align="center"><strong>Project Evals</strong></TableCell>
                  <TableCell align="center"><strong>Peer Reviews</strong></TableCell>
                  <TableCell align="center"><strong>Details</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.map((member, index) => (
                  <React.Fragment key={member.member._id}>
                    <TableRow hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box sx={{ mr: 1 }}>
                            {getRankIcon(index)}
                          </Box>
                          <Typography variant="body2">
                            #{index + 1}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            src={member.member.avatar}
                            sx={{ width: 36, height: 36, mr: 2 }}
                          >
                            {member.member.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {member.member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.member.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${member.finalScore.toFixed(1)}`}
                          color={getScoreColor(member.finalScore)}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`Project evaluation average: ${member.projectEvaluationAverage?.toFixed(1)}/10`}>
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <Grade fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography>{member.totalProjectEvaluations}</Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`Peer review average: ${member.peerReviewAverage?.toFixed(1)}/5`}>
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <Person fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography>{member.totalPeerReviews}</Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => toggleExpand(member.member._id)}
                        >
                          {expandedMember === member.member._id ? 
                            <KeyboardArrowUp /> : 
                            <KeyboardArrowDown />
                          }
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Details */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, borderBottom: expandedMember === member.member._id ? 1 : 0 }}>
                        <Collapse in={expandedMember === member.member._id} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 3, px: 2, bgcolor: 'background.default' }}>
                            {/* Performance Breakdown */}
                            <Box display="flex" sx={{ flexWrap: 'wrap', gap: 3, mb: 4 }}>
                              <Box sx={{ flex: '1 1 250px' }}>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                  <WorkspacePremium sx={{ verticalAlign: 'middle', mr: 1 }} />
                                  Performance Breakdown
                                </Typography>
                                <Box sx={{ pl: 2 }}>
                                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="body2">
                                      <strong>Project Evaluation:</strong>
                                    </Typography>
                                    <Chip
                                      label={`${member.projectEvaluationAverage?.toFixed(1)}/10`}
                                      color={getScoreColor(member.projectEvaluationAverage)}
                                      size="small"
                                    />
                                  </Box>
                                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="body2">
                                      <strong>Peer Review:</strong>
                                    </Typography>
                                    <Chip
                                      label={`${member.peerReviewAverage?.toFixed(1)}/5`}
                                      color={getScoreColor(member.peerReviewAverage * 2)} // Convert 5-point to 10-point
                                      size="small"
                                    />
                                  </Box>
                                  <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="body2">
                                      <strong>Final Score:</strong>
                                    </Typography>
                                    <Chip
                                      label={`${member.finalScore.toFixed(2)}/10`}
                                      color={getScoreColor(member.finalScore)}
                                      size="small"
                                    />
                                  </Box>
                                </Box>
                              </Box>
                              
                              <Box sx={{ flex: '1 1 250px' }}>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                  <GroupWork sx={{ verticalAlign: 'middle', mr: 1 }} />
                                  Review Statistics
                                </Typography>
                                <Box sx={{ pl: 2 }}>
                                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="body2" sx={{ minWidth: 180 }}>
                                      <strong>Project Evaluations:</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                      {member.totalProjectEvaluations}
                                    </Typography>
                                  </Box>
                                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="body2" sx={{ minWidth: 180 }}>
                                      <strong>Peer Reviews:</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                      {member.totalPeerReviews}
                                    </Typography>
                                  </Box>
                                  <Box display="flex" alignItems="center">
                                    <Typography variant="body2" sx={{ minWidth: 180 }}>
                                      <strong>Total Comments:</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                      {member.totalProjectComments || 0}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>

                            {/* Project Evaluation Comments */}
                            {member.commentsByEvaluator && member.commentsByEvaluator.length > 0 && (
                              <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                  <CommentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                  Project Evaluation Comments
                                </Typography>
                                
                                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                  {member.commentsByEvaluator.map((evaluatorData, evalIndex) => (
                                    <React.Fragment key={evalIndex}>
                                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                        <ListItemAvatar>
                                          <Avatar src={evaluatorData.evaluator.avatar}>
                                            {evaluatorData.evaluator.name.charAt(0)}
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                          primary={
                                            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                              <Typography variant="subtitle1" fontWeight="medium" >
                                                {evaluatorData.evaluator.name}
                                              </Typography>
                                              <Chip
                                                label={evaluatorData.evaluatorRole}
                                                size="small"
                                                color={evaluatorData.evaluatorRole === 'teacher' ? "primary" : "secondary"}
                                                variant="outlined"
                                                sx={{ ml: 1 }}
                                              />
                                              <Chip
                                                label={`Avg: ${evaluatorData.averageScore.toFixed(1)}/10`}
                                                size="small"
                                                color={getScoreColor(evaluatorData.averageScore)}
                                                sx={{ ml: 1 }}
                                              />
                                            </Box>
                                          }
                                          secondary={
                                            <Box sx={{ mt: 1 }}>
                                              {evaluatorData.categories.map((category, catIndex) => (
                                                <Paper 
                                                  key={catIndex}
                                                  sx={{ 
                                                    p: 1.5, 
                                                    mb: 1,
                                                    bgcolor: lighten(theme.palette.primary.main,0.3),
                                                    borderLeft: 2,
                                                    borderColor: 'primary.main'
                                                  }}
                                                >
                                                  <Box display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                                                    {getCategoryIcon(category.name)}
                                                    <Typography variant="body2" fontWeight="medium" sx={{ ml: 1 }}>
                                                      {category.name}
                                                    </Typography>
                                                    <Chip
                                                      label={`${category.score}/10`}
                                                      size="small"
                                                      sx={{ ml: 'auto' }}
                                                    />
                                                  </Box>
                                                  <Typography variant="body2" color="text.secondary">
                                                    {evaluatorData.comments[catIndex] || "No comment"}
                                                  </Typography>
                                                </Paper>
                                              ))}
                                            </Box>
                                          }
                                        />
                                      </ListItem>
                                      {evalIndex < member.commentsByEvaluator.length - 1 && (
                                        <Divider variant="inset" component="li" />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </List>
                              </Box>
                            )}

                            {/* Peer Reviews */}
                            {member.peerReviews && member.peerReviews.length > 0 && (
                              <Box>
                                <Typography variant="subtitle2" gutterBottom color="primary">
                                  <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                                  Peer Reviews
                                </Typography>
                                
                                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                  {member.peerReviews.map((review, reviewIndex) => (
                                    <React.Fragment key={reviewIndex}>
                                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                        <ListItemAvatar>
                                          <Avatar src={review.reviewer.avatar}>
                                            {review.reviewer.name.charAt(0)}
                                          </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                          primary={
                                            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                              <Typography variant="subtitle1" fontWeight="medium">
                                                {review.reviewer.name}
                                              </Typography>
                                              <Chip
                                                label={`Score: ${review.totalScore.toFixed(1)}/5`}
                                                size="small"
                                                color={getScoreColor(review.totalScore * 2)}
                                                sx={{ ml: 1 }}
                                              />
                                            </Box>
                                          }
                                          secondary={
                                            <Box sx={{ mt: 1 }}>
                                              <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                                                "{review.comment || 'No comment provided'}"
                                              </Typography>
                                              <Box display="flex" sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                <Chip 
                                                  label={`Contribution: ${review.scores.contribution}/5`}
                                                  size="small"
                                                  variant="outlined"
                                                />
                                                <Chip 
                                                  label={`Collaboration: ${review.scores.collaboration}/5`}
                                                  size="small"
                                                  variant="outlined"
                                                />
                                                <Chip 
                                                  label={`Quality: ${review.scores.quality}/5`}
                                                  size="small"
                                                  variant="outlined"
                                                />
                                                <Chip 
                                                  label={`Punctuality: ${review.scores.punctuality}/5`}
                                                  size="small"
                                                  variant="outlined"
                                                />
                                              </Box>
                                            </Box>
                                          }
                                        />
                                      </ListItem>
                                      {reviewIndex < member.peerReviews.length - 1 && (
                                        <Divider variant="inset" component="li" />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Note about evaluations */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              <strong>Note:</strong> Overall score combines project evaluations (70% weight) and peer reviews (30% weight). 
              Project evaluations assess the entire team's work, while peer reviews evaluate individual contributions.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MemberEvaluationSummary;