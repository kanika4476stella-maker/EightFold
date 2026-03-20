/**
 * gap_dna.js — Personalised Learning Path Generator
 * Produces concrete, week-by-week upskilling roadmaps following the provided AI prompt structure.
 */

const GapDNA = (() => {

  const SKILL_RESOURCES = {
    'python': {
      '30_days': {
        goal: 'Master Python for Data Engineering',
        resource: 'Python for Data Engineering (Coursera Specialization)',
        deliverable: 'A multi-threaded data scraper that handles API rate limiting and saves to PostgreSQL.'
      },
      '90_days': {
        goal: 'Produce Production-Ready Async Code',
        resource: 'High Performance Python (O\'Reilly Book) & Fast API Documentation',
        deliverable: 'A high-throughput REST API using FastAPI and Pydantic for data validation.'
      }
    },
    'spark': {
      '30_days': {
        goal: 'Understand Spark RDDs and DataFrames',
        resource: 'Spark & Big Data Essentials (Databricks Academy)',
        deliverable: 'A local Spark job processing 10GB of log data with optimized partitions.'
      },
      '90_days': {
        goal: 'Optimize Spark Jobs & Performance Tuning',
        resource: 'Spark Performance Tuning (Udemy) & AWS EMR Best Practices',
        deliverable: 'A production-level Spark job on EMR with custom broadcast joins and zero-shuffling.'
      }
    },
    'airflow': {
      '30_days': {
        goal: 'Build Basic Directed Acyclic Graphs (DAGs)',
        resource: 'Apache Airflow: The Hands-On Guide (Udemy)',
        deliverable: 'A 3-stage DAG that handles data ingestion, transformation, and alerting.'
      },
      '90_days': {
        goal: 'Advanced Airflow Operators & Orchestration',
        resource: 'Astronomer Certification for Airflow DAG Authors',
        deliverable: 'A dynamic DAG generator using TaskFlow API and custom KubernetesPodOperators.'
      }
    },
    'dbt': {
      '30_days': {
        goal: 'Implement dbt Models & Documentation',
        resource: 'dbt Fundamentals (dbt Labs)',
        deliverable: 'A complete dbt project with 10+ models, schema tests, and automated docs.'
      },
      '90_days': {
        goal: 'Advanced dbt: Macros & Snapshot Testing',
        resource: 'Advanced dbt Modeling (Analytics Engineers Handbook)',
        deliverable: 'A warehouse transformation layer with complex macros and SCD Type-2 snapshots.'
      }
    },
    'sql': {
      '30_days': {
        goal: 'Master Complex Joins & Window Functions',
        resource: 'Advanced SQL for Data Scientists (Datacamp)',
        deliverable: 'A set of 5 analytic queries solving "Cohort Retention" and "Moving Monthly Averages".'
      },
      '90_days': {
        goal: 'SQL Performance Tuning & Indexing',
        resource: 'PostgreSQL Performance Optimization (High Performance SQL)',
        deliverable: 'A database schema redesign with optimized indexes and partition tables.'
      }
    },
    'kafka': {
      '30_days': {
        goal: 'Implement Kafka Producers & Consumers',
        resource: 'Confluent Cloud: Kafka Fundamentals',
        deliverable: 'A real-time message stream that routes data based on header metadata.'
      },
      '90_days': {
        goal: 'Kafka Streams & KSQLDB for Analytics',
        resource: 'Kafka Streams: Real-time Stream Processing (Packt)',
        deliverable: 'A real-time stateful aggregation engine computing live transaction totals.'
      }
    },
    'kubernetes': {
      '30_days': {
        goal: 'Container Orchestration with K8s',
        resource: 'Kubernetes for the Absolute Beginners (Udemy)',
        deliverable: 'A multi-replica deployment with ConfigMaps and Secrets in a local minikube.'
      },
      '90_days': {
        goal: 'Production K8s: Helm & Ingress Controllers',
        resource: 'CKA Certified Kubernetes Administrator Prep',
        deliverable: 'A production-grade cluster deployment with Helm charts and Nginx Ingress.'
      }
    }
  };

  /**
   * Generates a personalised upskilling roadmap for an employee based on skill gaps.
   */
  async function generate(employee, job, gapSkills, hoursPerWeek = 10) {
    // Simulate short "AI reasoning" delay
    await new Promise(r => setTimeout(r, 800));

    const totalWeeks = gapSkills.length * 4; // Approx 4 weeks per major gap
    const readyDate = new Date();
    readyDate.setDate(readyDate.getDate() + (totalWeeks * 7));

    const phases = [];

    // Construct 30-day phase (Phase 1: Foundations)
    const firstSkill = gapSkills[0] || 'Domain Knowledge';
    const res30 = getResourceForSkill(firstSkill, '30_days');
    
    phases.push({
      phase: "30_days",
      focus_skill: firstSkill,
      weeks: Array.from({ length: 4 }).map((_, i) => ({
        week: i + 1,
        goal: `Internalize ${firstSkill} fundamentals and setup environment.`,
        resource: res30.resource,
        deliverable: i === 3 ? res30.deliverable : "Complete weekly module and quiz",
        hours: hoursPerWeek
      }))
    });

    // Construct 90-day phase (Phase 2: Advanced Application)
    if (gapSkills.length > 1) {
      const secondSkill = gapSkills[1];
      const res90 = getResourceForSkill(secondSkill, '90_days');
      
      phases.push({
        phase: "90_days",
        focus_skill: secondSkill,
        weeks: Array.from({ length: 8 }).map((_, i) => ({
          week: i + 5,
          goal: `Build production-grade systems with ${secondSkill}.`,
          resource: res90.resource,
          deliverable: i === 7 ? res90.deliverable : `Advanced lab for ${secondSkill} week ${i+1}`,
          hours: hoursPerWeek
        }))
      });
    }

    return {
      employee_name: employee.name,
      target_role: job.title,
      total_weeks: totalWeeks,
      estimated_ready_date: readyDate.toISOString().split('T')[0],
      phases: phases,
      success_metric: `Employee can independently architect and deploy a ${job.title} workflow including ${gapSkills.join(' and ')} to production.`
    };
  }

  function getResourceForSkill(skill, phase) {
    const key = skill.toLowerCase().trim();
    for (const [k, v] of Object.entries(SKILL_RESOURCES)) {
      if (key.includes(k) || k.includes(key)) return v[phase];
    }
    // Generic Fallback
    return {
      goal: `Master ${skill} best practices`,
      resource: `${skill} Professional Certificate (LinkedIn Learning)`,
      deliverable: `A functional module demonstrating ${skill} integration.`
    };
  }

  return { generate };
})();

window.GapDNA = GapDNA;
