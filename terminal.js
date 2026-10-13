(() => {
  const terminal = document.querySelector('.terminal-window');
  if (!terminal) return;

  const form = terminal.querySelector('.terminal-form');
  const input = form.elements.command;
  const cursor = terminal.querySelector('.terminal-cursor');
  const historyView = terminal.querySelector('.terminal-history');
  const locationLabel = terminal.querySelector('.terminal-location');
  const home = '/home/lehi';
  const projectDirectory = `${home}/projects`;
  const projects = [
    {
      name: 'cloud-portfolio',
      title: 'Cloud Portfolio',
      description: 'Personal website hosted on AWS for secure, scalable delivery.',
      href: 'https://github.com/lehibonafe/cloud-portfolio',
    },
    {
      name: 'quivecta',
      title: 'Quivecta',
      description: 'Serverless, event-driven Retrieval-Augmented Generation application.',
      href: 'https://github.com/lehibonafe/quivecta-aws-rag/blob/main/README.md',
    },
    {
      name: 'aws-three-tier',
      title: 'AWS Three-Tier Web Architecture',
      description: 'Highly available, scalable, and secure three-tier architecture for a web application.',
      href: 'https://github.com/lehibonafe/aws-ecs-fargate-cicd',
    },
    {
      name: 'anomalog',
      title: 'Anomalog',
      description: 'AI-powered AWS log intelligence and investigation workspace.',
      href: 'https://github.com/lehibonafe/aws-ecs-fargate-cicd',
    },
    {
      name: 'terraform-state',
      title: 'Terraform Remote State on AWS',
      description: 'S3 backend with DynamoDB locking, versioning, and IAM controls for shared Terraform state.',
      href: 'projects/terraform-state.html',
    },
  ];
  const focus = 'Cloud automation · CI/CD · observability';
  const sectionFolders = [
    'about', 'education', 'experience', 'tech-stack',
    'projects', 'certifications', 'artifacts', 'social-links',
  ];
  const commands = ['help', 'whoami', 'pwd', 'ls', 'cd', 'cat', 'open', 'echo', 'clear'];
  const directories = new Map([
    [home, ['README.md', ...sectionFolders.map((name) => `${name}/`)]],
    [`${home}/about`, ['bio.txt']],
    [`${home}/education`, ['degree.txt']],
    [`${home}/experience`, ['roles.txt']],
    [`${home}/tech-stack`, ['devops.txt', 'languages.txt', 'other.txt']],
    [projectDirectory, ['README.md', ...projects.map((project) => `${project.name}/`)]],
    [`${home}/certifications`, ['aws.txt']],
    [`${home}/artifacts`, ['events.txt']],
    [`${home}/social-links`, ['profiles.txt']],
    ...projects.map((project) => [`${projectDirectory}/${project.name}`, ['README.md']]),
  ]);
  const files = new Map([
    [`${home}/README.md`, 'Use ls, cd, and cat to browse the sections.'],
    [`${home}/about/bio.txt`, 'Jr. Site Reliability Engineer focused on monitoring and reliable, scalable, automated systems. Interested in cloud, CI/CD, containers, and infrastructure as code.'],
    [`${home}/education/degree.txt`, 'BS in Computer Engineering\nSamar State University · 2015–2020'],
    [`${home}/experience/roles.txt`, 'Site Reliability Engineer · eTap Inc. · 2026\nIT Analyst · CGIC · 2024'],
    [`${home}/tech-stack/devops.txt`, 'AWS · Docker · GitHub Actions · Terraform · Git · Linux · Kubernetes'],
    [`${home}/tech-stack/languages.txt`, 'Python · Bash · HTML · CSS · MySQL'],
    [`${home}/tech-stack/other.txt`, 'Jira · Grafana · REST APIs · Networking · Codex · RAG · LLM'],
    [`${home}/projects/README.md`, `${projects.map((project) => project.title).join(' · ')}\nUse open <project> to view a project.`],
    [`${home}/certifications/aws.txt`, 'AWS Solutions Architect — Associate\nAWS Developer — Associate'],
    [`${home}/artifacts/events.txt`, 'AWS Summit Manila 2024\nKubeCon SEA 2024\nHashiConf 2023\nDevOps Days Manila 2023'],
    [`${home}/social-links/profiles.txt`, 'LinkedIn: https://www.linkedin.com/in/lehi-bonafe/\nMedium: https://medium.com/@lehivelardebonafe'],
    ...projects.map((project) => [
      `${projectDirectory}/${project.name}/README.md`,
      `${project.title}\n${project.description}\n${project.href}`,
    ]),
  ]);

  let currentDirectory = home;
  const commandHistory = [];
  let historyIndex = 0;
  let draft = '';

  function updateCursor() {
    const characterWidth = cursor.getBoundingClientRect().width;
    const position = (input.selectionStart ?? input.value.length) * characterWidth - input.scrollLeft;
    const maxPosition = Math.max(0, input.clientWidth - characterWidth);
    cursor.style.left = `${Math.max(0, Math.min(position, maxPosition))}px`;
  }

  ['input', 'click', 'keyup', 'scroll', 'select'].forEach((eventName) => {
    input.addEventListener(eventName, updateCursor);
  });
  window.addEventListener('resize', updateCursor);
  updateCursor();

  terminal.addEventListener('click', (event) => {
    if (event.target.closest?.('a')) return;
    input.focus();
    updateCursor();
  });

  function resolvePath(path = '.') {
    const absolute = path.startsWith('~')
      ? `${home}${path.slice(1)}`
      : path.startsWith('/') ? path : `${currentDirectory}/${path}`;
    const parts = [];

    for (const part of absolute.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') parts.pop();
      else parts.push(part);
    }

    const resolved = `/${parts.join('/')}`;
    return resolved === home || resolved.startsWith(`${home}/`) ? resolved : null;
  }

  function addText(block, message) {
    const line = document.createElement('p');
    line.className = 'terminal-output';
    line.textContent = message;
    block.append(line);
  }

  function addProjectLinks(block, selectedProjects = projects) {
    const list = document.createElement('div');
    list.className = 'terminal-output terminal-projects';

    selectedProjects.forEach((project) => {
      const link = document.createElement('a');
      link.href = project.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = `${project.name}/`;
      list.append(link);
    });

    block.append(list);
  }

  function addDirectoryEntries(block, path) {
    const list = document.createElement('div');
    list.className = 'terminal-output terminal-list';

    directories.get(path).forEach((entry) => {
      const line = document.createElement('span');
      if (entry.endsWith('/')) line.className = 'terminal-folder';
      line.textContent = entry;
      list.append(line);
    });

    block.append(list);
  }

  function completeInput() {
    const caret = input.selectionStart ?? input.value.length;
    if (caret !== input.selectionEnd) return false;

    const before = input.value.slice(0, caret);
    const after = input.value.slice(caret);
    const remainingToken = after.match(/^\S*/)[0];
    const remainder = after.slice(remainingToken.length);
    const token = before.match(/\S*$/)[0];
    const start = caret - token.length;
    const preceding = before.slice(0, start).trim();
    let matches;
    let pathPrefix = '';

    if (!preceding) {
      matches = commands.filter((command) => command.startsWith(token.toLowerCase()));
    } else {
      const words = preceding.split(/\s+/);
      if (words.length !== 1) return false;

      const command = words[0].toLowerCase();
      if (command === 'open') {
        matches = projects.map((project) => project.name)
          .filter((name) => name.startsWith(token.toLowerCase()));
      } else if (['cd', 'cat', 'ls'].includes(command)) {
        const slash = token.lastIndexOf('/');
        pathPrefix = token.slice(0, slash + 1);
        const partial = token.slice(slash + 1);
        const directory = resolvePath(pathPrefix || '.');
        matches = (directories.get(directory) || []).filter((entry) =>
          entry.startsWith(partial) && (command !== 'cd' || entry.endsWith('/'))
          && (command !== 'cat' || !entry.endsWith('/')));
      } else {
        return false;
      }
    }

    if (!matches.length) return true;

    let completion = matches[0];
    if (matches.length > 1) {
      for (const candidate of matches.slice(1)) {
        while (!candidate.startsWith(completion)) completion = completion.slice(0, -1);
      }
    }

    const replacement = pathPrefix + completion;
    if (replacement !== token || matches.length === 1) {
      const addSpace = matches.length === 1 && !replacement.endsWith('/') && !remainder.startsWith(' ');
      input.value = before.slice(0, start) + replacement + (addSpace ? ' ' : '') + remainder;
      const nextCaret = start + replacement.length + (addSpace ? 1 : 0);
      input.setSelectionRange(nextCaret, nextCaret);
      updateCursor();
    }

    if (matches.length > 1) {
      if (historyView.lastElementChild?.className === 'terminal-block terminal-suggestions') {
        historyView.lastElementChild.remove();
      }
      const block = document.createElement('div');
      block.className = 'terminal-block terminal-suggestions';
      addText(block, matches.map((match) => pathPrefix + match).join('   '));
      historyView.append(block);
      while (historyView.children.length > 50) historyView.firstElementChild.remove();
      historyView.scrollTop = historyView.scrollHeight;
    }

    return true;
  }

  function runCommand(raw, block) {
    const [command, ...args] = raw.split(/\s+/);

    switch (command.toLowerCase()) {
      case 'help':
        addText(block,
          'help              show commands\n' +
          'whoami            about me\n' +
          'pwd               show current path\n' +
          'ls [path]         list section files\n' +
          'cd [path]         enter a folder\n' +
          'cat <file>        read a file\n' +
          'open <project>    open a project\n' +
          'echo <text>       print text\n' +
          'clear             clear output\n' +
          'Tab               complete commands and paths');
        break;
      case 'whoami':
        addText(block, 'Lehi Bonafe · Site Reliability Engineer');
        break;
      case 'pwd':
        addText(block, currentDirectory);
        break;
      case 'ls': {
        if (args.length > 1) {
          addText(block, 'Usage: ls [path]');
          break;
        }
        const path = resolvePath(args[0]);
        if (directories.has(path)) addDirectoryEntries(block, path);
        else if (files.has(path)) addText(block, path.split('/').pop());
        else addText(block, `ls: ${args[0] || '.'}: No such file or directory`);
        break;
      }
      case 'cd': {
        if (args.length > 1) {
          addText(block, 'Usage: cd [path]');
          break;
        }
        const path = resolvePath(args[0] || '~');
        if (!directories.has(path)) {
          addText(block, `cd: ${args[0] || '~'}: No such directory`);
          break;
        }
        currentDirectory = path;
        const displayPath = path.replace(home, '~');
        locationLabel.textContent = displayPath;
        addText(block, displayPath);
        break;
      }
      case 'cat': {
        if (args.length !== 1) {
          addText(block, 'Usage: cat <file>');
          break;
        }
        const path = resolvePath(args[0]);
        if (files.has(path)) {
          addText(block, files.get(path));
        } else if (directories.has(path)) {
          addText(block, `cat: ${args[0]}: Is a directory`);
        } else {
          addText(block, `cat: ${args[0]}: No such file`);
        }
        break;
      }
      case 'open': {
        if (args.length !== 1) {
          addText(block, 'Usage: open <project>');
          break;
        }
        const name = args[0] === '.' && currentDirectory.startsWith(`${projectDirectory}/`)
          ? currentDirectory.split('/').pop()
          : args[0].replace(/\/$/, '').split('/').pop().toLowerCase();
        const project = projects.find((item) => item.name === name);
        if (!project) {
          addText(block, `open: ${args[0]}: Project not found. Try ls projects/`);
          break;
        }
        addText(block, `Opening ${project.name}/`);
        addProjectLinks(block, [project]);
        window.open(project.href, '_blank', 'noopener,noreferrer');
        break;
      }
      case 'echo':
        addText(block, args.join(' '));
        break;
      case 'clear':
        historyView.replaceChildren();
        break;
      default:
        addText(block, `${command}: command not found. Type help for commands.`);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const raw = input.value.trim();
    if (!raw) return;

    commandHistory.push(raw);
    if (commandHistory.length > 50) commandHistory.shift();
    historyIndex = commandHistory.length;
    draft = '';
    input.value = '';
    input.setSelectionRange(0, 0);

    const block = document.createElement('div');
    block.className = 'terminal-block';
    const prompt = document.createElement('p');
    prompt.className = 'terminal-command';
    const dollar = document.createElement('span');
    dollar.setAttribute('aria-hidden', 'true');
    dollar.textContent = '$';
    prompt.append(dollar, document.createTextNode(` ${raw}`));
    block.append(prompt);
    historyView.append(block);

    runCommand(raw, block);
    while (historyView.children.length > 50) historyView.firstElementChild.remove();
    historyView.scrollTop = historyView.scrollHeight;
    input.focus();
    updateCursor();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      if (completeInput()) event.preventDefault();
    } else if (event.key === 'ArrowUp' && commandHistory.length) {
      event.preventDefault();
      if (historyIndex === commandHistory.length) draft = input.value;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = commandHistory[historyIndex];
      input.setSelectionRange(input.value.length, input.value.length);
      updateCursor();
    } else if (event.key === 'ArrowDown' && commandHistory.length) {
      event.preventDefault();
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      input.value = historyIndex === commandHistory.length ? draft : commandHistory[historyIndex];
      input.setSelectionRange(input.value.length, input.value.length);
      updateCursor();
    }
  });
})();
