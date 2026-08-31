/* HanaShift — guided demo engine
   All responses are pre-scripted. Replace OUT / REPLY with real model calls
   once the keigo adapter is ready. */

(function () {
  const stage = document.getElementById('stage');
  if (!stage) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = { used: [] };

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const wait = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 120) : ms));
  const toBottom = () => { stage.scrollTop = stage.scrollHeight; };

  function add(html, cls) {
    const d = document.createElement('div');
    d.className = (cls || 'row') + ' fade';
    d.innerHTML = html;
    stage.appendChild(d);
    toBottom();
    return d;
  }

  /* a bot line that appears after a short "typing" beat */
  async function bot(html, beat) {
    const t = add('<div class="think"><span class="dots"><i></i><i></i><i></i></span></div>');
    await wait(beat === undefined ? 650 : beat);
    t.remove();
    return add('<div class="bot">' + html + '</div>');
  }

  function me(text) {
    return add('<div class="bubble">' + esc(text) + '</div>', 'row me');
  }

  /* longer, labelled reasoning pause before a generated answer */
  async function thinking(label, ms) {
    const t = add('<div class="think"><span class="dots"><i></i><i></i><i></i></span>' +
      '<span class="lbl"><b>HanaShift</b> · ' + esc(label) + '</span></div>');
    await wait(ms === undefined ? 3000 : ms);
    t.remove();
  }

  function ask(question, options) {
    return new Promise(resolve => {
      const node = add('<div class="bot">' + (question ? esc(question) : '') +
        '<div class="opts"></div></div>');
      const box = node.querySelector('.opts');
      if (!question) node.querySelector('.bot').style.padding = '10px 14px';

      options.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'opt';
        b.type = 'button';
        b.style.animationDelay = (reduce ? 0 : i * 70) + 'ms';
        if (o.locked) {
          b.disabled = true;
          b.innerHTML = '<span class="lock">&#9642;</span>' + esc(o.label);
          b.title = 'Available after registration';
        } else {
          b.textContent = o.label;
          b.addEventListener('click', () => {
            box.querySelectorAll('.opt').forEach(x => { x.disabled = true; });
            b.classList.add('chosen');
            resolve(o);
          });
        }
        box.appendChild(b);
      });
      toBottom();
    });
  }

  function steps(labels, activeIdx) {
    add('<div class="steps">' + labels.map((l, i) =>
      '<span class="chip' + (i <= activeIdx ? ' on' : '') + '">' + (i + 1) + ' &middot; ' +
      esc(l) + '</span>').join('') + '</div>', 'row');
  }

  function gate(title, sub) {
    const g = document.createElement('div');
    g.className = 'gate fade';
    g.innerHTML = '<div style="flex:1;min-width:220px"><b>' + esc(title) + '</b><span>' +
      esc(sub) + '</span></div><button class="gold">REQUEST BETA ACCESS</button>';
    g.querySelector('button').addEventListener('click', () => {
      const f = document.getElementById('form');
      if (!f) { location.href = 'index.html#form'; return; }
      f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      f.classList.add('flash');
      const n = document.getElementById('n');
      if (n) n.focus({ preventScroll: true });
      setTimeout(() => f.classList.remove('flash'), 1600);
    });
    stage.appendChild(g);
    toBottom();
  }

  /* ---------------- scripted content ---------------- */

  const OUT = {
    senior: {
      reg: 'SONKEIGO + KENJŌGO — highest register',
      mail: '件名：火曜日のお打合せの件\n\n山田部長\n\nいつもお世話になっております。\n火曜日の会議の件、承知いたしました。\n関連資料につきましては、本日中に送付させていただきます。\n\n何卒よろしくお願い申し上げます。',
      terms: [
        ['いつもお世話になっております', 'Kenjōgo', 'The mandatory opening to an external client. Literally "I am always receiving your care" — it is not translated, it is used. Leaving it out reads as abrupt, even if everything else is polite.'],
        ['承知いたしました', 'Kenjōgo', 'The humble form of "to acknowledge". It lowers your own action in front of the client. 了解しました is fine between equals, but to a senior it reads as curt.'],
        ['送付させていただきます', 'Kenjōgo', '"I humbly receive permission to send." In English this sounds excessive; in Japan it is the standard: you implicitly ask permission to act.'],
        ['何卒よろしくお願い申し上げます', 'Kenjōgo', 'Formal closing. 申し上げます is the humble form of "to request" — one step more deferential than お願いします.']
      ]
    },
    colleague: {
      reg: 'TEINEIGO — standard internal politeness',
      mail: '件名：火曜日の打ち合わせ\n\n田中さん\n\nお疲れ様です。\n火曜日の会議、了解しました。\n資料は今日中に送ります。\n\nよろしくお願いします。',
      terms: [
        ['お疲れ様です', 'Teineigo', 'The internal opening. Between colleagues いつもお世話になっております would sound strange — like addressing the person at the next desk as a stranger.'],
        ['了解しました', 'Teineigo', 'Correct here, because you are peers. The same word sent to the senior client in the other version would have been a misstep.'],
        ['送ります', 'Teineigo', 'Plain polite form. Using 送付させていただきます with a colleague would make you sound sarcastic or annoyed.'],
        ['よろしくお願いします', 'Teineigo', 'Neutral closing. The 申し上げます of the client version would be disproportionate here.']
      ]
    },
    supplier: {
      reg: 'MODERATE KEIGO — polite without deference',
      mail: '件名：火曜日のお打ち合わせの件\n\nいつもお世話になっております。\n火曜日の会議の件、承知いたしました。\n資料は本日中にお送りいたします。\n\nよろしくお願いいたします。',
      terms: [
        ['いつもお世話になっております', 'Kenjōgo', 'Stays: this is the formula for anyone outside your company, client or supplier alike.'],
        ['承知いたしました', 'Kenjōgo', 'Keeps the humble form — politeness towards outsiders never drops entirely.'],
        ['お送りいたします', 'Kenjōgo', 'This is where the level changes. Towards a supplier, the "asking permission" of 送付させていただきます sounds excessive, because the negotiating position is yours. お送りいたします is courteous without submitting.'],
        ['よろしくお願いいたします', 'Kenjōgo', 'One step below 申し上げます: respectful, but without the deference reserved for a client.']
      ]
    }
  };

  const CONTRAST = {
    senior: 'a senior client',
    colleague: 'a colleague',
    supplier: 'a supplier'
  };

  async function scenarioA() {
    const S = ['Context', 'Draft', 'Keigo', 'Why'];
    steps(S, 0);
    await wait(300);

    const who = await ask(
      'Let\'s write an email to a Japanese contact together. Who are you writing to?',
      [{ label: 'Senior client', v: 'senior' }, { label: 'Colleague', v: 'colleague' },
       { label: 'Supplier', v: 'supplier' }, { label: 'Government body', locked: true }]);
    me(who.label);
    await wait(320);

    const rel = await ask('What is your relationship so far?',
      [{ label: 'First contact' }, { label: 'Established relationship' },
       { label: 'Sensitive situation', locked: true }]);
    me(rel.label);
    await wait(320);

    const goal = await ask('What is the message meant to do?',
      [{ label: 'Confirm a meeting' }, { label: 'Request an extension', locked: true },
       { label: 'Apologise', locked: true }, { label: 'Decline', locked: true }]);
    me(goal.label);
    await wait(320);

    await bot('<b>Why I ask all this first.</b><br>Japanese has no single correct translation: the verb forms change ' +
      'depending on who reads the message. The same English sentence will now produce a different email because of the answer you just gave.', 900);
    await wait(500);

    steps(S, 1);
    const draft = await ask('Now pick the message the way you would say it in English. The Japanese register is my job.',
      [{ label: '"Confirming Tuesday\'s meeting. I\'ll send the documents."' },
       { label: '"OK for Tuesday, sending everything over."' }]);
    me(draft.label.replace(/"/g, ''));
    await wait(400);

    await thinking('selecting register, checking honorific consistency…', 3000);

    const o = OUT[who.v];
    steps(S, 2);
    add('<div class="mail"><span class="lbl">READY TO SEND &middot; ' + esc(o.reg) + '</span>' +
      '<pre>' + esc(o.mail) + '</pre></div>', 'row');
    await wait(700);

    steps(S, 3);
    add('<div class="gloss"><b>Why I wrote it this way — line by line</b>' +
      o.terms.map(t => '<div class="term"><span class="jp">' + esc(t[0]) + '</span>' +
        '<span class="kind">' + esc(t[1]) + '</span><p>' + esc(t[2]) + '</p></div>').join('') +
      '</div>', 'row');
    await wait(600);

    const other = who.v === 'senior' ? 'colleague' : 'senior';
    await bot('Want to see how the <b>same sentence</b> changes if you were writing to ' +
      CONTRAST[other] + ' instead? This is the comparison that usually surprises people.', 800);
    const cmp = await ask('', [{ label: 'Show me the comparison', v: other }, { label: 'No, I get it', v: null }]);
    if (cmp.v) {
      me(cmp.label);
      await thinking('re-generating in a different register…', 2200);
      const c = OUT[cmp.v];
      add('<div class="mail" style="border-color:#D4D8E8"><span class="lbl" style="color:#6B7290">SAME SENTENCE &middot; ' +
        esc(c.reg) + '</span><pre>' + esc(c.mail) + '</pre>' +
        '<div class="note amber"><b>What changed</b>' + esc(c.terms[2][2]) + '</div></div>', 'row');
      await wait(500);
    }
    finish();
  }

  async function scenarioB() {
    const S = ['Incoming', 'Subtext', 'Reply'];
    steps(S, 0);
    await wait(300);

    await bot('You sent a commercial proposal to your Japanese contact. This came back.', 700);
    add('<div class="bot"><span style="font-size:10px;letter-spacing:.8px;color:#9AA0B5;font-weight:600">' +
      'INCOMING &middot; 山田部長</span><pre style="font-family:var(--jp);font-size:14px;line-height:1.75;' +
      'margin:8px 0 0;white-space:pre-wrap">ご提案の件、拝見いたしました。\n大変興味深い内容でございますが、社内でもう少し検討させていただければと存じます。\n引き続きどうぞよろしくお願いいたします。</pre></div>', 'row');
    await wait(700);

    const g = await ask('How do you read it?',
      [{ label: 'They\'re interested', v: 'yes' }, { label: 'They\'re still thinking', v: 'maybe' },
       { label: 'It\'s a no', v: 'no' }]);
    me(g.label);
    await wait(400);

    await thinking('reading tone markers and business context…', 3000);

    steps(S, 1);
    add('<div class="bot"><div class="note red" style="margin:0"><b>This is not a yes</b>' +
      'Machine translation renders 検討させていただければ as "we would like to review it internally", which reads like good news. ' +
      'In practice 検討させていただければと存じます combined with 大変興味深い ("very interesting", with no commitment) is the standard way to buy time: ' +
      'the proposal has not been refused, but it has not been accepted either. The real signal is the absence of a date.</div></div>', 'row');
    await wait(800);

    steps(S, 2);
    const r = await ask('How do you reply in English?',
      [{ label: 'Accept and wait', v: 'wait' }, { label: 'Propose a date myself', v: 'date' },
       { label: 'Ask for a yes or no', v: 'force' }]);
    me(r.label);
    await wait(400);

    await thinking('drafting a reply that keeps the relationship open…', 3000);

    const REPLY = {
      wait: {
        txt: 'Thank you for taking the time to review our proposal. Please take all the time you need — we look forward to hearing from you.',
        cls: 'red', head: 'Polite, but you lose control',
        body: 'With no date in it, the file slides to the bottom of the pile and the next move belongs entirely to them. In Japan silence is not a no, but it is not a yes either: it is a wait that can run for months.'
      },
      date: {
        txt: 'Thank you for reviewing our proposal, and for taking the time to consider it internally.\n\nTo support your review, we would be glad to share a short summary of the ESG impact figures. Would it be helpful if we followed up in two weeks, or would a different timing suit your internal process better?',
        cls: 'amber', head: 'The recommended route',
        body: 'It does not ask for a yes or no — which would put your contact on the spot — but it proposes a date and leaves them free to correct it. That is how you apply pressure without breaking the rule against putting the other party in a difficult position. It also gives a concrete reason to talk again.'
      },
      force: {
        txt: 'Could you let us know whether you are moving forward with the proposal or not?',
        cls: 'red', head: 'Risky',
        body: 'It forces your contact into an explicit refusal. In Japan making someone say no costs both sides face: the most likely answer is not a no, it is permanent silence.'
      }
    }[r.v];

    add('<div class="mail"' + (REPLY.cls === 'red' ? ' style="border-color:#E0B4B4"' : '') + '>' +
      '<span class="lbl"' + (REPLY.cls === 'red' ? ' style="color:#B03A3A"' : '') + '>REPLY &middot; BUSINESS ENGLISH</span>' +
      '<pre style="font-family:var(--sans);font-size:13px;line-height:1.6">' + esc(REPLY.txt) + '</pre>' +
      '<div class="note ' + REPLY.cls + '"><b>' + esc(REPLY.head) + '</b>' + esc(REPLY.body) + '</div></div>', 'row');
    await wait(600);
    finish();
  }

  function finish() {
    const left = 2 - state.used.length;
    if (left > 0) {
      add('<div class="quiet">The beta opens up scenarios for your own sector, memory of the people you write to regularly, and the ESG module.</div>', 'row');
      ask('', [{ label: 'Try the other scenario', v: 'next' }, { label: 'I\'ve seen enough', v: 'end' }])
        .then(c => {
          if (c.v === 'next') { stage.innerHTML = ''; start(); }
          else gate('Thanks for trying the demo.', 'Register your company to unlock unlimited scenarios and your own sector.');
        });
    } else {
      gate('Demo complete — you have used both free scenarios.',
        'In beta: unlimited scenarios, your sector\'s vocabulary and memory of your regular contacts.');
    }
  }

  async function start() {
    if (state.used.length >= 2) {
      await bot('You have already used both free scenarios in this session.');
      gate('Demo complete', 'Register to keep practising without limits.');
      return;
    }
    const doneA = state.used.indexOf('A') > -1, doneB = state.used.indexOf('B') > -1;

    await bot('<b style="font-size:15px">Pick a scenario to try</b><br>' +
      'I\'ll guide you step by step. You don\'t need to know Japanese: I explain every language choice as we make it.', 400);

    const pick = document.createElement('div');
    pick.className = 'pick fade';
    pick.innerHTML =
      '<button class="card" data-s="A"' + (doneA ? ' disabled' : '') + '><span class="tag">EN &rarr; 日本語</span>' +
      '<h4>Write an email in Japanese</h4><p>' + (doneA ? 'Already completed in this session.' :
        'From your English sentence to business keigo, with an explanation of every form used.') + '</p></button>' +
      '<button class="card" data-s="B"' + (doneB ? ' disabled' : '') + '><span class="tag">日本語 &rarr; EN</span>' +
      '<h4>Read and answer an email</h4><p>' + (doneB ? 'Already completed in this session.' :
        'A keigo email lands in your inbox: I decode what it really says and we build the reply together.') + '</p></button>';
    stage.appendChild(pick);
    toBottom();

    await wait(220);
    const lock = document.createElement('div');
    lock.className = 'fade';
    lock.innerHTML = '<p class="eyebrow">AVAILABLE AFTER REGISTRATION</p><div class="locked">' +
      ['Price negotiation', 'Board meeting', 'ESG / SDG reporting']
        .map(t => '<div class="lockrow">&#9642; ' + t + '</div>').join('') + '</div>';
    stage.appendChild(lock);
    toBottom();

    pick.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => {
      const s = c.dataset.s;
      state.used.push(s);
      stage.innerHTML = '';
      (s === 'A' ? scenarioA : scenarioB)();
    }));
  }

  start();
})();
