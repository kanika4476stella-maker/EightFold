/**
 * data.js — Sample data for TalentScope
 * Included via script tag to avoid CORS issues with local file:// fetch
 */

window.TALENTSCOPE_DATA = {
  employees_csv: `id,name,title,department,experience_years,skills,certifications,education
EMP001,Aanya Sharma,Data Analyst,Analytics,5,"Python,SQL,Tableau,Excel,Statistics,pandas,numpy","Google Data Analytics,AWS Cloud Practitioner",B.Tech Computer Science
EMP002,Rohan Mehta,Backend Engineer,Engineering,7,"Python,Django,PostgreSQL,Redis,Docker,Kubernetes,REST APIs,Git","AWS Solutions Architect,PostgreSQL Certified",B.E. Information Technology
EMP003,Priya Nair,Product Manager,Product,6,"Agile,Scrum,JIRA,Roadmapping,Stakeholder Management,A/B Testing,SQL,Figma","Certified Scrum Master,Google PM Certificate",MBA Product Management
EMP004,Arjun Patel,Frontend Engineer,Engineering,4,"JavaScript,React,TypeScript,CSS,HTML,Redux,GraphQL,Webpack,Jest","Meta Frontend Developer,AWS Cloud Practitioner",B.Tech Computer Science
EMP005,Sneha Gupta,ML Engineer,AI/ML,6,"Python,TensorFlow,PyTorch,Scikit-learn,pandas,SQL,Docker,MLflow,Spark","TensorFlow Developer,AWS ML Specialty",M.Tech AI
EMP006,Karan Singh,DevOps Engineer,Infrastructure,8,"Docker,Kubernetes,Terraform,AWS,CI/CD,Jenkins,Ansible,Linux,Bash,Prometheus","AWS DevOps Engineer,CKA,Terraform Associate",B.E. Computer Science
EMP007,Meera Reddy,Data Engineer,Engineering,3,"Python,SQL,Spark,Airflow,dbt,BigQuery,Snowflake,ETL","Google Cloud Professional Data Engineer",B.Tech IT
EMP008,Rahul Joshi,Data Engineer,Analytics,5,"Python,SQL,Spark,Kafka,Airflow,dbt,PostgreSQL,Redis,Docker","AWS Data Analytics,Databricks Associate",B.Tech Computer Science
EMP009,Anita Krishnan,Business Analyst,Strategy,4,"SQL,Excel,PowerBI,Tableau,Requirements Gathering,Stakeholder Management,Process Mapping","PMP,Tableau Desktop Specialist",B.Com + MBA
EMP010,Vikram Bose,Software Engineer,Engineering,6,"Java,Spring Boot,Microservices,Docker,Kubernetes,PostgreSQL,REST APIs,RabbitMQ","AWS Solutions Architect,Oracle Java Certified",B.Tech Software Engineering
EMP011,Pooja Iyer,Data Scientist,AI/ML,4,"Python,R,Scikit-learn,pandas,SQL,Tableau,Statistics,A/B Testing","Google Data Analytics,Databricks ML Associate",M.Sc. Statistics
EMP012,Nikhil Sharma,Cloud Engineer,Infrastructure,5,"AWS,Azure,GCP,Terraform,Docker,Kubernetes,Python,Bash","AWS Solutions Architect,Azure Administrator,GCP Associate",B.Tech Computer Science
EMP013,Divya Menon,UX Designer,Design,5,"Figma,Adobe XD,User Research,Wireframing,Prototyping,CSS,HTML,A/B Testing","Google UX Design,HFI CUA",B.Des Interaction Design
EMP014,Saurabh Tiwari,Data Analyst,Analytics,2,"SQL,Python,Excel,Tableau,Statistics","Google Data Analytics",B.Tech Computer Science
EMP015,Laleh Ahmadi,Platform Engineer,Engineering,9,"Python,Spark,Kafka,Airflow,dbt,Kubernetes,Docker,Terraform,AWS,PostgreSQL","AWS DevOps Engineer,CKA,Databricks Associate",M.Tech Distributed Systems`,

  jobs: [
    {
      "id": "JD001",
      "title": "Senior Data Engineer",
      "department": "Engineering",
      "min_experience": 4,
      "description": "We are looking for a Senior Data Engineer to build and maintain our scalable data pipelines. You will work on ingesting, transforming, and orchestrating large-scale datasets in a cloud-native environment.",
      "required_skills": ["Python", "Spark", "SQL", "dbt", "Airflow"],
      "nice_to_have": ["Kafka", "Kubernetes", "AWS", "PostgreSQL", "Docker"],
      "responsibilities": [
        "Design and build robust ETL/ELT pipelines",
        "Maintain and optimize Spark jobs for large-scale data processing",
        "Collaborate with analytics and ML teams on data modeling",
        "Implement data quality checks and monitoring"
      ]
    },
    {
      "id": "JD002",
      "title": "Senior Product Manager",
      "department": "Product",
      "min_experience": 5,
      "description": "Lead product strategy and roadmap for our core platform. Drive cross-functional collaboration with engineering, design, and business stakeholders.",
      "required_skills": ["Agile", "Roadmapping", "Stakeholder Management", "A/B Testing", "SQL"],
      "nice_to_have": ["Scrum", "JIRA", "Figma", "PowerBI", "OKRs"],
      "responsibilities": [
        "Define and own the product roadmap",
        "Gather requirements from stakeholders and translate to specs",
        "Work with engineering and design to deliver features",
        "Define KPIs and track product metrics"
      ]
    },
    {
      "id": "JD003",
      "title": "ML Platform Engineer",
      "department": "AI/ML",
      "min_experience": 5,
      "description": "Build and operate the ML platform powering our AI products. You will architect model training infrastructure, feature stores, and model serving pipelines.",
      "required_skills": ["Python", "Spark", "Docker", "Kubernetes", "MLflow"],
      "nice_to_have": ["Airflow", "Kafka", "TensorFlow", "AWS", "Terraform"],
      "responsibilities": [
        "Build and scale ML training and serving infrastructure",
        "Develop feature engineering pipelines",
        "Own model deployment and monitoring systems",
        "Collaborate with ML engineers and data scientists"
      ]
    }
  ]
};
