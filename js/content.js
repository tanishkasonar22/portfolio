/* All portfolio text for the 3D office. Source of truth: classic.html.
   Each section's HTML is rendered into the reading panel when you walk into its cabin. */
(function () {
  const EMAIL = 'sonartanishka357@gmail.com';
  const LINKS = {
    email: EMAIL,
    linkedin: 'https://www.linkedin.com/in/tanishka-sonar-73a35a233/',
    github: 'https://github.com/tanishkasonar22',
    resume: 'https://drive.google.com/file/d/1zADc7BWIJJ6LWtwy_XqlWxh0bYlz2yUr/view?usp=sharing',
  };

  const tags = a => `<div class="tags">${a.map(t => `<span class="tag">${t}</span>`).join('')}</div>`;
  const ext = (href, label) => `<a href="${href}" target="_blank" rel="noopener">${label} ↗</a>`;

  const SECTIONS = {
    about: {
      n: '01', name: 'About',
      html: `
    <h2>Engineer by training, craftsman by habit.</h2>
    <p class="lede">Software Engineering Intern at Gruve.ai with a proven track record in AI/ML architecture, developer tooling, and quantum computing research. A published author and Graduate TA combining academic rigor with hands-on development. Highly focused on bridging the gap between high-performance distributed systems and accessible, user-centric engineering. Expertly balances tight performance budgets with robust architectural design to ship impactful, respectful software.</p>
    <div class="stats">
      <div class="stat"><b>94%</b><small>Model accuracy achieved</small></div>
      <div class="stat"><b>5K+</b><small>Support tickets analyzed</small></div>
      <div class="stat"><b>80+</b><small>Students mentored as TA</small></div>
      <div class="stat"><b>2</b><small>Research papers</small></div>
    </div>
    <div class="spot" data-spot="skills">
    <div class="group"><div class="label">Programming &amp; scripting languages</div>${tags(['Python', 'C/C++', 'JavaScript', 'HTML', 'CSS', 'Go'])}</div>
    <div class="group"><div class="label">Frameworks &amp; libraries</div>${tags(['Scikit-learn', 'REST API', 'Pandas', 'OpenCV', 'MediaPipe', 'Matplotlib', 'Node.js', 'FastAPI', 'gRPC', 'NLTK'])}</div>
    <div class="group"><div class="label">Databases &amp; data formats</div>${tags(['PostgreSQL', 'MySQL', 'MongoDB', 'NoSQL', 'Firebase', 'Redis'])}</div>
    <div class="group"><div class="label">Technologies &amp; tools</div>${tags(['PySpark', 'RadixUI', 'Tableau', 'Databricks', 'Bootstrap', 'Agile/Scrum'])}</div>
    <div class="group"><div class="label">Cloud &amp; DevOps</div>${tags(['AWS (EC2, S3)', 'GCP', 'Docker', 'Kubernetes', 'GKE', 'Helm', 'Terraform', 'Prometheus', 'Grafana', 'CI/CD', 'Linux', 'Git', 'GitHub'])}</div>
    <div class="group"><div class="label">Quantum computing</div>${tags(['D-Wave Ocean SDK', 'Google Cirq', 'QUBO', 'QAOA'])}</div>
    </div>`,
    },

    projects: {
      n: '02', name: 'Projects',
      html: `
    <h2>Projects I'm proud of.</h2>
    <ul class="items">
      <li class="item"><h3>Multimodal AI Interview Simulator</h3>
        <p>Real-time interview platform with computer vision, facial expression recognition, and speech synthesis. Fine-tuned ResNet-18 for attention and gaze detection at 94% accuracy, delivering adaptive, personalized feedback.</p>
        ${tags(['Python', 'PyTorch', 'MediaPipe', 'ResNet-18', 'LLMs', 'SadTalker', 'TTS'])}
        <div class="links">${ext('https://github.com/xqsong-angie/Realtime-Coding-Interviewer', 'GitHub')}</div></li>
      <li class="item" data-spot="siren"><h3>Siren: Industrial IoT Telemetry Pipeline</h3>
        <p>End-to-end IoT pipeline for Oil &amp; Gas: simulates multi-sensor machinery drift, streams via Redis, and feeds three AI services — predictive maintenance, leak detection, and NLP incident parsing. Full observability with Prometheus + Grafana.</p>
        ${tags(['Python', 'Redis', 'Docker', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana'])}
        <div class="links">${ext('https://github.com/tanishkasonar22/Siren', 'GitHub')}</div></li>
      <li class="item"><h3>Optimizing Traffic with Quantum Computing</h3>
        <p>Modeled 158 nodes and 185 edges as a QUBO with D-Wave Ocean SDK to improve routing efficiency by 30% and cut estimated fuel use by 20%. Ran QAOA on Google Cirq for 40% faster computation than classical solvers. Research paper in print.</p>
        ${tags(['D-Wave Ocean SDK', 'Google Cirq', 'QUBO', 'QAOA', 'OpenStreetMap', 'Python'])}
        <div class="links">${ext('https://github.com/tanishkasonar22/Traffic-optimisation-using-Quantum-Computing-', 'GitHub')}</div></li>
      <li class="item"><h3>Healthcare ChatBot</h3>
        <p>HealthBot is an AI-powered conversational assistant that makes early health awareness accessible. Built with Python and Flask, it uses NLP and machine learning to analyze symptoms against 10,000+ clinical cases, mapping 150+ conditions with 94% accuracy and delivering preliminary guidance.</p>
        ${tags(['Python', 'Flask', 'NLP', 'Machine Learning', 'scikit-learn', 'TensorFlow'])}
        <div class="links">${ext('https://github.com/tanishkasonar22/Healthcare-chatbot-', 'GitHub')}</div></li>
      <li class="item"><h3>Car Pool Connect</h3>
        <p>A full-stack ride-sharing platform designed to reduce carbon footprints and commute costs. Connects drivers and passengers in real time with secure authentication, route matching, and an integrated booking dashboard.</p>
        ${tags(['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Google Maps API', 'JWT'])}
        <div class="links">${ext('https://github.com/tanishkasonar22/carpooling', 'GitHub')}${ext('https://drive.google.com/file/d/1juzpk5n6-WR-3YA7hf4tQMyWlOMporlR/view', 'Demo')}</div></li>
      <li class="item"><h3>Buy to Door</h3>
        <p>Buy to Door is an age-verified ticket shop built on the Credence Cloud SDK. A buyer proves they are over 21 from the digital ID in their phone wallet, and the shop learns only one thing: yes or no. It stores no name, birth date or photo.</p>
        <p>A strict rule in the shop, not an AI model, makes the final decision. Only a clear “yes” passes, and the buyer gets a signed, single-use ticket and a privacy receipt. Buyers without a digital ID can still buy a ticket marked for an ID check at the gate. Organisers get a dashboard, a setup-readiness check and a gate view, none of which show personal details.</p>
        <p>It works with a simulated wallet (mock mode) and with a real Android wallet answering live Credence requests. It has 266 automated tests.</p>
        ${tags(['Credence Cloud SDK', 'Digital ID', 'Age verification', 'Privacy', 'Android wallet'])}
        <div class="links">${ext('https://github.com/tanishkasonar22/buy-to-door', 'GitHub')}</div></li>
    </ul>`,
    },

    experience: {
      n: '03', name: 'Experience',
      html: `
    <h2>Where I've worked.</h2>
    <ul class="items">
      <li class="item"><div class="item-top"><h3>Software Engineering Intern</h3><span class="when">Jun 2026 — Present</span></div>
        <div class="meta">Gruve.ai · Houston, TX</div>
        <p>Building the control plane for a GPU Job-as-a-Service platform on Kubernetes (GKE) — job orchestration and a reconciliation loop in Python, gRPC, and PostgreSQL. Shipped keyless GCS auth via Workload Identity and an engine-agnostic deploy API for KServe inference (vLLM, Triton), replacing hand-written YAML with a single call.</p></li>
      <li class="item"><div class="item-top"><h3>Software &amp; DevOps Engineering Intern</h3><span class="when">Jan 2026 — May 2026</span></div>
        <div class="meta">Rice University · Transformational Technology &amp; Innovation</div>
        <p>Built a BERT-based ticket sentiment system with NLP pipelines that hit 88% accuracy on 5,000+ tickets and cut triage time by 35%, wired into the existing ticketing stack to prioritize IT support by the data.</p></li>
      <li class="item"><div class="item-top"><h3>Graduate Teaching Assistant</h3><span class="when">Sep 2025 — May 2026</span></div>
        <div class="meta">Rice University · Probabilistic Algorithms &amp; Data Science</div>
        <p>Ran office hours and mentored 80+ graduate students end-to-end on probabilistic algorithms, statistical modeling, and applied ML pipelines — lifting average project scores by 20%.</p></li>
      <li class="item"><div class="item-top"><h3>Software Engineering Intern</h3><span class="when">Jun 2023 — Jul 2023</span></div>
        <div class="meta">ESDS Software Solution · Nashik, India</div>
        <p>Built an employee record management system in PHP + MySQL automating workflows for 200+ records, and deployed and monitored AWS (EC2, S3) infrastructure at 99.9% uptime.</p></li>
    </ul>
    <div class="spot" data-spot="leadership">
    <div class="label sub">Leadership &amp; community</div>
    <ul class="items">
      <li class="item"><div class="item-top"><h3>Creative Head</h3><span class="meta">CSI, FCRIT</span></div>
        <p>Led a creative team on visual branding and marketing for major technical symposiums, driving a 40% increase in event registrations.</p></li>
      <li class="item"><div class="item-top"><h3>NSS Volunteer</h3><span class="meta">FCRIT</span></div>
        <p>Dedicated 240+ hours to community development, educational tutoring, and public-health drives for 200+ local residents through a special 7-day camp.</p></li>
    </ul>
    </div>`,
    },

    life: {
      n: '04', name: 'Life',
      html: `
    <h2>Life outside the terminal.</h2>
    <ul class="items">
      <li class="item" data-spot="volleyball"><h3>Volleyball Player</h3><p>Competitive team athlete</p></li>
      <li class="item" data-spot="painting"><h3>Loves Painting</h3><p>Canvas and digital art</p></li>
      <li class="item" data-spot="gaming"><h3>Avid Gamer</h3><p>Strategy and open-world RPGs</p></li>
    </ul>
    <p class="aside">Look around this cabin: the volleyball, the easel and the gaming rig are all here.</p>`,
    },

    contact: {
      n: '05', name: 'Contact',
      html: `
    <h2>Let's build something together.</h2>
    <p>I'm always up for a coffee chat, collaboration, or a good technical rabbit hole. Fastest way to reach me is email.</p>
    <div class="email-row spot" data-spot="email"><span class="email">${EMAIL}</span><button class="copy" type="button" data-copy="${EMAIL}">Copy email</button></div>
    <div class="cta">
      <a class="btn primary" href="mailto:${EMAIL}">Say hello</a>
      <a class="btn" href="${LINKS.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
      <a class="btn" href="${LINKS.github}" target="_blank" rel="noopener">GitHub ↗</a>
      <a class="btn" href="${LINKS.resume}" target="_blank" rel="noopener">Resume ↗</a>
    </div>
    <p class="aside">© 2026 Tanishka Sonar. Crafted with care.</p>`,
    },
  };

  window.OFFICE_CONTENT = { LINKS, SECTIONS };
})();
