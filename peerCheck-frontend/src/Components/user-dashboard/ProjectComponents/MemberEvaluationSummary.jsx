import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Grid,
  alpha,
  useMediaQuery
} from "@mui/material";
import {
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
  Insights
} from "@mui/icons-material";
import axiosClient from "@/api/axiosClient";

const MemberEvaluationSummary = ({ projectId, theme }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedMember, setExpandedMember] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get(`/projects/${projectId}/member-evaluation-summary`);
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
    return (
      <Typography variant="h6" color="text.secondary">
        {index + 1}
      </Typography>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "technical execution":
        return <Code fontSize="small" />;
      case "task validity":
        return <Task fontSize="small" />;
      case "time authenticity":
        return <Schedule fontSize="small" />;
      case "teamwork":
        return <GroupWork fontSize="small" />;
      case "documentation quality":
        return <Description fontSize="small" />;
      default:
        return <Grade fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4} p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!summary.length) {
    return (
      <Box mt={4}>
        <Alert severity="info">No member evaluations found for this project.</Alert>
      </Box>
    );
  }

  const topMember = summary[0];
  const averageFinalScore = summary.reduce((sum, member) => sum + (member.finalScore || 0), 0) / summary.length;
  const totalPeerReviews = summary.reduce((sum, member) => sum + (member.totalPeerReviews || 0), 0);
  const totalProjectComments = summary.reduce((sum, member) => sum + (member.totalProjectComments || 0), 0);

  return (
    <Box mt={3}>
      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
              <Avatar sx={{ bgcolor: "primary.main", width: { xs: 50, sm: 58 }, height: { xs: 50, sm: 58 } }}>
                <Groups />
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                  Team Performance Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.length} team member{summary.length !== 1 ? "s" : ""} • Combined project and peer evaluations
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={<TrendingUp />}
              label={`Top: ${topMember?.member?.name || "N/A"} • ${topMember?.finalScore?.toFixed(1) || "0"}/10`}
              color="primary"
              sx={{
                maxWidth: "100%",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }
              }}
            />
          </Box>

          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                <Typography variant="caption" color="text.secondary">Average score</Typography>
                <Typography variant="h5" fontWeight={800}>{averageFinalScore.toFixed(1)}/10</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, backgroundColor: alpha(theme.palette.success.main, 0.08) }}>
                <Typography variant="caption" color="text.secondary">Top performer</Typography>
                <Typography variant="h5" fontWeight={800}>#{1}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, backgroundColor: alpha(theme.palette.warning.main, 0.08) }}>
                <Typography variant="caption" color="text.secondary">Peer reviews</Typography>
                <Typography variant="h5" fontWeight={800}>{totalPeerReviews}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, backgroundColor: alpha(theme.palette.secondary.main, 0.08) }}>
                <Typography variant="caption" color="text.secondary">Comments logged</Typography>
                <Typography variant="h5" fontWeight={800}>{totalProjectComments}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
          mb: 3
        }}
      >
        {summary.slice(0, 3).map((member, index) => (
          <Card
            key={member.member._id}
            sx={{
              borderRadius: 4,
              border: `1px solid ${alpha(index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32", 0.45)}`,
              background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.75 }}>
                <Box>{getRankIcon(index)}</Box>
                <Avatar src={member.member.avatar} sx={{ width: 48, height: 48 }}>
                  {member.member.name.charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ wordBreak: "break-word" }}>
                    {member.member.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rank #{index + 1}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Overall score
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 1 }}>
                <Typography variant="h4" fontWeight={900} color={`${getScoreColor(member.finalScore)}.main`}>
                  {member.finalScore.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">/10</Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={member.finalScore * 10}
                sx={{
                  height: 9,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.text.primary, 0.08),
                  "& .MuiLinearProgress-bar": {
                    bgcolor: `${getScoreColor(member.finalScore)}.main`
                  }
                }}
              />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.75 }}>
                <Chip size="small" icon={<Grade />} label={`${member.projectEvaluationAverage?.toFixed(1) || "0.0"}/10 project`} />
                <Chip size="small" icon={<Person />} label={`${member.peerReviewAverage?.toFixed(1) || "0.0"}/5 peer`} />
                <Chip size="small" icon={<CommentIcon />} label={`${member.totalProjectComments || 0} comments`} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" }, gap: 1.25, mb: 2.5 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Team Performance Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tap a member to see their breakdown, evaluator comments, and peer review details.
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1.5}>
            {summary.map((member, index) => (
              <Paper
                key={member.member._id}
                variant="outlined"
                sx={{
                  p: { xs: 1.75, sm: 2.25 },
                  borderRadius: 3.5,
                  borderColor: expandedMember === member.member._id
                    ? alpha(theme.palette.primary.main, 0.45)
                    : alpha(theme.palette.divider, 0.32)
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1.5
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, width: "100%" }}>
                    <Box>{getRankIcon(index)}</Box>
                    <Avatar src={member.member.avatar} sx={{ width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 } }}>
                      {member.member.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ wordBreak: "break-word" }}>
                        {member.member.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                        {member.member.email}
                      </Typography>
                    </Box>
                    <Chip label={`${member.finalScore.toFixed(1)}/10`} color={getScoreColor(member.finalScore)} size="small" />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                      gap: 1,
                      width: "100%"
                    }}
                  >
                    <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2.5, backgroundColor: alpha(theme.palette.primary.main, 0.07) }}>
                      <Typography variant="caption" color="text.secondary">Project</Typography>
                      <Typography variant="body2" fontWeight={800}>{member.projectEvaluationAverage?.toFixed(1) || "0.0"}/10</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2.5, backgroundColor: alpha(theme.palette.secondary.main, 0.07) }}>
                      <Typography variant="caption" color="text.secondary">Peer</Typography>
                      <Typography variant="body2" fontWeight={800}>{member.peerReviewAverage?.toFixed(1) || "0.0"}/5</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2.5, backgroundColor: alpha(theme.palette.warning.main, 0.07) }}>
                      <Typography variant="caption" color="text.secondary">Reviews</Typography>
                      <Typography variant="body2" fontWeight={800}>{member.totalPeerReviews}</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2.5, backgroundColor: alpha(theme.palette.info.main, 0.07) }}>
                      <Typography variant="caption" color="text.secondary">Comments</Typography>
                      <Typography variant="body2" fontWeight={800}>{member.totalProjectComments || 0}</Typography>
                    </Paper>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5, gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="body2" color="text.secondary">
                    Weighted from project evaluations and peer reviews.
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => toggleExpand(member.member._id)}
                    endIcon={expandedMember === member.member._id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  >
                    {expandedMember === member.member._id ? "Hide details" : "View details"}
                  </Button>
                </Box>

                <Collapse in={expandedMember === member.member._id} timeout="auto" unmountOnExit>
                  <Box sx={{ pt: 2 }}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05), height: "100%" }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            <WorkspacePremium sx={{ verticalAlign: "middle", mr: 1 }} />
                            Performance Breakdown
                          </Typography>
                          <Stack spacing={1.1}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2"><strong>Project Evaluation</strong></Typography>
                              <Chip label={`${member.projectEvaluationAverage?.toFixed(1)}/10`} color={getScoreColor(member.projectEvaluationAverage)} size="small" />
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2"><strong>Peer Review</strong></Typography>
                              <Chip label={`${member.peerReviewAverage?.toFixed(1)}/5`} color={getScoreColor(member.peerReviewAverage * 2)} size="small" />
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2"><strong>Final Score</strong></Typography>
                              <Chip label={`${member.finalScore.toFixed(2)}/10`} color={getScoreColor(member.finalScore)} size="small" />
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, backgroundColor: alpha(theme.palette.secondary.main, 0.05), height: "100%" }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            <Insights sx={{ verticalAlign: "middle", mr: 1 }} />
                            Review Statistics
                          </Typography>
                          <Stack spacing={1.1}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2"><strong>Project Evaluations</strong></Typography>
                              <Typography variant="body2">{member.totalProjectEvaluations}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2"><strong>Peer Reviews</strong></Typography>
                              <Typography variant="body2">{member.totalPeerReviews}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2"><strong>Total Comments</strong></Typography>
                              <Typography variant="body2">{member.totalProjectComments || 0}</Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>

                    {member.commentsByEvaluator && member.commentsByEvaluator.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          <CommentIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                          Project Evaluation Comments
                        </Typography>

                        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                          {member.commentsByEvaluator.map((evaluatorData, evalIndex) => (
                            <React.Fragment key={evalIndex}>
                              <ListItem alignItems="flex-start" sx={{ py: 2, px: { xs: 0, sm: 1 } }}>
                                <ListItemAvatar>
                                  <Avatar src={evaluatorData.evaluator.avatar}>
                                    {evaluatorData.evaluator.name.charAt(0)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1 }}>
                                      <Typography variant="subtitle1" fontWeight="medium">
                                        {evaluatorData.evaluator.name}
                                      </Typography>
                                      <Chip
                                        label={evaluatorData.evaluatorRole}
                                        size="small"
                                        color={evaluatorData.evaluatorRole === "teacher" ? "primary" : "secondary"}
                                        variant="outlined"
                                      />
                                      <Chip
                                        label={`Avg: ${evaluatorData.averageScore.toFixed(1)}/10`}
                                        size="small"
                                        color={getScoreColor(evaluatorData.averageScore)}
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
                                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                                            borderLeft: 2,
                                            borderColor: "primary.main"
                                          }}
                                        >
                                          <Box display="flex" alignItems="center" sx={{ mb: 0.5, gap: 1, flexWrap: "wrap" }}>
                                            {getCategoryIcon(category.name)}
                                            <Typography variant="body2" fontWeight="medium">
                                              {category.name}
                                            </Typography>
                                            <Chip label={`${category.score}/10`} size="small" sx={{ ml: "auto" }} />
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
                            </React.Fragment>
                          ))}
                        </List>
                      </Box>
                    )}

                    {member.peerReviews && member.peerReviews.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          <Person sx={{ verticalAlign: "middle", mr: 1 }} />
                          Peer Reviews
                        </Typography>

                        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                          {member.peerReviews.map((review, reviewIndex) => (
                            <React.Fragment key={reviewIndex}>
                              <ListItem alignItems="flex-start" sx={{ py: 2, px: { xs: 0, sm: 1 } }}>
                                <ListItemAvatar>
                                  <Avatar src={review.reviewer.avatar}>
                                    {review.reviewer.name.charAt(0)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1 }}>
                                      <Typography variant="subtitle1" fontWeight="medium">
                                        {review.reviewer.name}
                                      </Typography>
                                      <Chip
                                        label={`Score: ${review.totalScore.toFixed(1)}/5`}
                                        size="small"
                                        color={getScoreColor(review.totalScore * 2)}
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="body2" sx={{ mb: 1, fontStyle: "italic" }}>
                                        "{review.comment || "No comment provided"}"
                                      </Typography>
                                      <Box display="flex" sx={{ flexWrap: "wrap", gap: 1 }}>
                                        <Chip label={`Contribution: ${review.scores.contribution}/5`} size="small" variant="outlined" />
                                        <Chip label={`Collaboration: ${review.scores.collaboration}/5`} size="small" variant="outlined" />
                                        <Chip label={`Quality: ${review.scores.quality}/5`} size="small" variant="outlined" />
                                        <Chip label={`Punctuality: ${review.scores.punctuality}/5`} size="small" variant="outlined" />
                                      </Box>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            </React.Fragment>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </Stack>

          <Alert severity="info" sx={{ mt: 2, borderRadius: 3 }}>
            <Typography variant="caption">
              <strong>Note:</strong> Overall score combines project evaluations (30% weight) and peer reviews (70% weight).
              Project evaluations assess the entire team's work, while peer reviews evaluate individual contributions.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MemberEvaluationSummary;
