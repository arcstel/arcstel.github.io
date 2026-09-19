# Topological Field Arithmetic: Foundations, Obstructions, and a Harmonic-Analysis Reframing

**Author:** William Paul Sindle
**Date:** February 2023
**Status:** Concept paper with a rigorous negative core. Established results are
cited; the framework's own claims are labeled as conjectures.

> **Scope and honesty statement.** This paper proposes a reading of
> "Topological Field Arithmetic" (TFA) that is consistent with known mathematics.
> It does not claim to prove a new theory. Part 2 proves several *obstructions*
> (negative results) that constrain what such a theory can be. Part 3 identifies
> established mathematics — Fourier/Pontryagin duality, generating functions, the
> circle method, and adelic analysis — in which the core intuition already exists
> rigorously. The numerical claims about \(\alpha\) and \(\phi\) are quarantined
> in Appendix A and explicitly marked as speculation.

---

## Abstract

The original TFA sketch proposed that numbers be modeled as excitations of a
continuous topological medium, that arithmetic operations be reinterpreted as
resonance and scattering, and that physical constants emerge as topological
thresholds. We show that the first two claims, taken literally, are either
vacuous or collapse to ordinary arithmetic (Proposition 2.1), and that the
emergent-constant claim is self-undermining once continuous dependence on model
parameters is assumed (Theorem 2.4). We then show
that the intuitive content of "numbers as waves interacting" is not merely
analogous to but *identical with* classical harmonic analysis on locally compact
abelian groups (Section 3), and that the most natural "medium" for arithmetic is
the adele ring of the rationals, in the sense of Tate's thesis. The paper
concludes with a corrected, minimal formulation of TFA and a list of open
problems. The emergence-of-constants proposal is neither supported nor refuted
here; it is isolated as an untested speculation.

---

## 1. Introduction

The motivating intuition is worth preserving: that arithmetic might be viewed
dynamically, through superposition and interference, rather than as a static
table of facts. The error of the original sketch was to treat this intuition as
*new*. It is not. Additive structure is already represented by convolution and
its Fourier dual; arithmetic is already studied through oscillatory integrals;
and the topology of the rationals is already the subject of p-adic and adelic
analysis. This paper's contribution is to say so plainly, prove what can be
proven against the stronger claims, and propose where genuine research could go.

We do not begin from a clean slate. We begin from a caricature that must be
corrected before anything else can be built.

---

## 2. Refutations and Repairs

This is the paper's core. Each subsection states a claim, refutes it, and states
the repair.

### 2.1 The representation obstruction: re-description is not replacement

**Claim (original).** TFA "fundamentally replaces traditional discrete
arithmetic" with a field model.

**Refutation.** Let \(A\) be any unital ring and \(\varphi:\mathbb{Z}\to A\) any
unital ring homomorphism — that is, any encoding that preserves \(0,1,+,\times\).

**Proposition 2.1 (standard).** \(\varphi\) is uniquely determined by
\(\varphi(1)=1_A\), namely \(\varphi(n)=n\cdot 1_A\), and its image is the prime
subring:
\[
\varphi(\mathbb{Z}) \;\cong\; \begin{cases} \mathbb{Z}, & \operatorname{char} A = 0,\\ \mathbb{F}_p, & \operatorname{char} A = p.\end{cases}
\]
*Proof.* A unital ring homomorphism preserves \(1\) and addition, so
\(\varphi(n)=\varphi(\underbrace{1+\cdots+1}_{n})=n\cdot 1_A\); the kernel is an
ideal of \(\mathbb{Z}\), hence \((0)\) or \((p)\), and \(\mathbb{Z}/\ker\varphi\)
is the image. \(\;\blacksquare\)

Consequently, *any* structure that correctly reproduces integer arithmetic
contains, by construction, an isomorphic copy of arithmetic. The arithmetic
identities are inherited from \(\mathbb{Z}\), not derived from the medium. The
medium can only contribute *extra* structure beyond the image — and that extra
structure must be exhibited and justified, not asserted. As stated, "replacement"
is unsupported; the stated model is a representation.

**Repair.** Abandon "replacement." Ask instead: *what new structure does the
medium provide, and what does it let us prove that \(\mathbb{Z}\) does not?*
This turns a false claim into a research question.

### 2.2 Conservation laws of the proposed form are vacuous

**Claim.** "Mathematical balance is maintained through conservation laws"
replacing symbolic equality.

**Refutation.** Suppose \(\nu\) encodes numbers and \(\Phi\) is any flux
functional. The demand \(\Phi(u\oplus v)=\Phi(u)+\Phi(v)\) is satisfied
*trivially* by \(\Phi := \nu^{-1}\), or by any additive functional. Such a law
restates \(A+B=C\); it does not add dynamics. Any conservation statement has
content only when \(\Phi\) is defined **geometrically** (independent of the
encoding) and is shown to be invariant for non-obvious reasons.

**Repair.** Specify \(\Phi\) geometrically and prove invariance as a theorem —
or drop the claim.

### 2.3 "Bounded infinity" conflates cardinality with compactness

**Claim.** Infinity can be "compressed" into a finite volume by inward fractal
folding, creating "infinite complexity in bounded space."

**Refutation.** This confuses two different notions.

- **Boundedness/compactness** is a metric/topological property. Compact spaces
  are abundant and can be enormous: \([0,1]\), the Cantor set, the profinite
  integers \(\hat{\mathbb{Z}}\), and the p-adic integers \(\mathbb{Z}_p\) are all
  compact.
- **Cardinality** is not reduced by self-maps. A function from a set to itself
  cannot collapse an infinite cardinal to a finite one unless the set was finite.
  There is no map compressing \(2^{\aleph_0}\) into a finite set.

Compactness already delivers "unbounded complexity in a bounded object," for
example \(\hat{\mathbb{Z}}\) with its profinite topology — but this is a
statement about topology, not about shrinking the number of points. The phrase
"dimensional compression" is undefined and, read literally, impossible.

**Repair.** Replace "bounded infinity" with the well-defined question: *can
arithmetic be represented by the dynamics of a compact space?* (See
Section 3.3; the answer for a large class is yes, via profinite and adelic
models.)

### 2.4 Emergent constants face a genericity problem

**Claim.** \(\alpha \approx 1/137\) and \(\phi\) are topological thresholds of
the medium rather than free parameters.

**Refutation (partly factual, partly heuristic).**

1. **It is not \(1/137\).** The measured value is
   \(\alpha \approx 1/137.035999\), and \(\alpha\) is scale-dependent
   (it "runs" under renormalization). "137" is a famously overworked numerical
   target.
2. **Continuous thresholds are not generically isolated numbers.** A critical
   value of a smooth functional can typically be moved by smoothly deforming the
   functional. Isolated, protected values generally arise from *discrete*
   structure (topological or symmetry protection), which yields integers or
   rationals — not a transcendental-looking real.
3. Therefore a mechanism that outputs \(1/137.035999\ldots\) without fitting a
   parameter would require an integer-like relation or a rigidity theorem. None
   is supplied.

**Theorem 2.4 (restricted no-go for emergent constants).** Let
\(\Theta\subseteq\mathbb{R}^n\) be a connected, open parameter space of models,
and let \(c:\Theta\to\mathbb{R}\) be a quantity claimed to "emerge" as a fixed
constant (for example, a critical threshold of a smooth potential). Assume:

> (i) \(c\) depends continuously on the model \(\theta\in\Theta\); and
> (ii) \(c\) is constant on some nonempty open set \(U\subseteq\Theta\) (the
> class of models under consideration).

Then \(c\) is constant on all of \(\Theta\). Equivalently: a quantity that is both
*emergent from a continuously varying model* and *fixed to a specific
non-generic value* must in fact be hard-wired — it cannot be a derived output.

*Proof.* Suppose \(c\) is locally constant at some \(\theta_0\in\Theta\). The set
\(S=\{\theta: c(\theta)=c(\theta_0)\}\) is open by local constancy and closed by
continuity, so \(S\) is clopen; since \(\Theta\) is connected and \(S\neq\varnothing\),
\(S=\Theta\). Thus a locally constant \(c\) is globally constant.

Conversely, if \(c\) is not locally constant at some \(\theta_0\), then by
continuity \(c\) maps every neighborhood of \(\theta_0\) to a set containing an
interval of positive length (intermediate value theorem), so \(c\) attains every
value in that interval for suitable \(\theta\). Matching any prescribed measured
value \(c_\star\) in that interval therefore requires *selecting* \(\theta\)
accordingly — that is, tuning a free parameter. If \(c_\star\notin c(\Theta)\)
the model simply fails. \(\;\blacksquare\)

**Corollary 2.5 (topological escape, and why it also fails for \(\alpha\)).**
The only way to evade Theorem 2.4 is for \(c\) to be *locally constant while not
globally constant* — i.e. a discrete, topologically or symmetry-protected
invariant. Such invariants take values in a discrete set (integers, or rationals)
and are invariant under continuous deformation. But the measured \(\alpha\) is
*not* deformation-invariant: it runs with energy scale. Therefore \(\alpha\)
cannot be a purely topological invariant of a fixed model; and if the model
changes discontinuously with scale, assumption (i) fails and the value is an
input rather than a derivation.

**Remark (what Theorem 2.4 does and does not establish).** It is not a proof that
no conceivable mechanism fixes a constant. It is a precise statement that, *under
continuous dependence*, "emergence" and "fixed to a non-generic value" are
mutually exclusive unless the value is discrete. This turns the vague heuristic
into a checkable criterion: any claimed derivation must exhibit either (a) an
explicit discontinuous/topological invariant, or (b) an explicit tuning
parameter, and must say which.

**Repair.** Move the \(\alpha,\phi\) claim to Appendix A as speculation, and
adopt the falsifiable constraint: *any candidate model must output \(\alpha\)
with zero fitted parameters.* By Theorem 2.4, meeting that constraint forces a
discrete invariant, which Corollary 2.5 then rules out for the running
\(\alpha\). This is the sharpest available statement of why the original claim
fails.

### 2.5 Summary of refutations

| Original claim | Verdict | Repair |
|---|---|---|
| "Replaces arithmetic" | Unsupported; representation obstruction (2.1) | Ask what new structure the medium adds |
| "Conservation replaces equality" | Vacuous as stated (2.2) | Define \(\Phi\) geometrically; prove invariance |
| "Bounded infinity / compression" | Ill-posed / impossible as stated (2.3) | Use compact dynamics on \(\hat{\mathbb{Z}},\mathbb{Z}_p\) |
| "\(\alpha,\phi\) emerge" | No-go for continuous models (Thm 2.4); numerically unsupported (2.4) | Zero-parameter test, or remove |

---

## 3. What Survives: The Intuition Already Exists, Rigorously

The salvageable idea — "numbers as waves that superpose and interfere" — is not
merely analogous to known mathematics; in the cases below it *is* known
mathematics. TFA should be built on these, not rediscover them by metaphor.

### 3.1 Addition is convolution; convolution is multiplication (Fourier)

Let \(G\) be a locally compact abelian group with dual \(\hat{G}\).

**Theorem 3.1 (convolution theorem; standard).** For \(f,g\in L^1(G)\),
\[
\widehat{f*g}(\chi) = \hat f(\chi)\,\hat g(\chi), \qquad \chi\in\hat G .
\]
Thus **superposition/addition in one representation is multiplication in the
dual**. This is the rigorous content of "arithmetic as wave interaction."

**Coefficient form.** For formal power series,
\[
\Bigl(\sum_n a_n x^n\Bigr)\Bigl(\sum_n b_n x^n\Bigr)
= \sum_n c_n x^n, \qquad c_n=\sum_{i+j=n}a_i b_j ,
\]
i.e. the **product of generating functions is additive convolution of
coefficients**. This is the standard bridge between additive and multiplicative
number theory.

### 3.2 The circle method: additive number theory as oscillatory integrals

The Hardy–Littlewood circle method expresses counts of additive representations
(e.g. Goldbach-type and Waring-type problems) as integrals of exponential sums
over the circle. This is "resonance and interference" used as a proof technique,
and it is one of the great successes of twentieth-century number theory.
Recommending it as TFA's computational engine is both honest and productive.

### 3.3 The adeles: the true "medium" for arithmetic

The most defensible "topological medium containing the numbers" is not
invented — it is the **adele ring** \(\mathbb{A}_{\mathbb{Q}}\), a locally compact
topological ring in which \(\mathbb{Q}\) embeds diagonally, with the p-adic
fields \(\mathbb{Q}_p\) and the real place completing it. **Tate's thesis**
develops arithmetic as harmonic analysis (zetas, L-functions) on \(\mathbb{A}\).
If TFA wants a field with genuine topology whose arithmetic is a first-class
object, this is it.

Related rigorous "number+dynamics" models:
- **Profinite integers / odometers.** \(\hat{\mathbb{Z}}\) is a compact group;
  the odometer (adding machine) is a dynamical system whose orbit structure
  encodes arithmetic.
- **p-adic analysis.** Ultrametric fields where closeness is number-theoretic.

### 3.4 Arakelov geometry for "volume" and "conservation"

The original "volume/flux" language has a real home: Arakelov geometry endows
arithmetic schemes with metric and volume data, allowing intersection theory and
"heights" (a genuine notion of size) on arithmetic objects. This is where
conservation-like language can be made precise rather than metaphorical.

---

## 4. A Minimal, Corrected Formulation

We can now state TFA without overclaiming.

**Definition 4.1.** A *field representation of arithmetic* is a topological
group or ring \(M\) (the medium) together with an injective unital ring
homomorphism \(\nu:\mathbb{Z}\to M\) (or \(\mathbb{Q}\to M\)) whose image is
arithmetic and whose ambient structure satisfies independently motivated
conditions.

**Definition 4.2.** The representation is *non-trivial* if \(M\) carries
structure not generated by \(\nu(\mathbb{Z})\) — e.g. a Haar measure, a dual
group, a dynamics — and if that structure yields at least one statement about
arithmetic not obtainable from \(\mathbb{Z}\) alone.

**Program.** Find a non-trivial field representation in which a classical
theorem is reproved, or a new statement is proved, via the medium's dynamics.

Under this definition, the adelic/p-adic models are field representations, and
the circle method is a computational realization. The original sketch is a
motivation for Definition 4.1 with no realization attached.

---

## 5. Open Problems

1. **Existence/non-existence.** Is there a non-trivial field representation whose
   dynamics proves a result not accessible by standard methods? (Reproving a
   known theorem counts as evidence; new theorems count as success.)
2. **Sharpening Theorem 2.4.** Extend the no-go past continuous dependence:
   characterize what a "discontinuous emergence" mechanism would have to look
   like, and quantify the minimum tuning required when (i) fails.
3. **Classical limit.** For any candidate medium, show how discrete arithmetic
   arises as a limiting case; absent this, the model does not connect to the
   theory it claims to generalize.
4. **Selection principle.** Given the freedom in \(P\) and \(\Phi\), find a
   principle that singles out one model.
5. **Adelic reformulation.** Can any part of TFA be stated as a theorem about
   \(\mathbb{A}_{\mathbb{Q}}\)? If yes, TFA becomes a subfield of existing
   mathematics rather than a rival to it.

---

## 6. Conclusion

The original TFA text is best read as a *motivation*, not a theory. Its core
errors are (i) claiming to replace arithmetic when any faithful model is
isomorphic to it (Prop. 2.1), (ii) invoking conservation laws that are vacuous
unless geometrically defined (2.2), (iii) an incoherent notion of "bounded
infinity" that conflates compactness with cardinality (2.3), and (iv) a no-go
for continuously-dependent emergent-constant mechanisms (Theorem 2.4) together
with unsupported numerology about \(\alpha\) and \(\phi\) (2.4). Its core insight — that addition
is convolution and multiplication is its dual — is correct and *already
rigorous* in Fourier/Pontryagin analysis, generating functions, the circle
method, and adelic arithmetic. The honest path is to build there.

---

## Appendix A — Speculation (Not Supported)

*A separate, explicitly speculative appendix. Nothing here is claimed to be
true.*

One may still ask whether a dimensionless constant could be a topological
invariant of some medium. For this to be science it must (a) define the medium
and functional concretely, (b) compute a number with **no fitted parameters**,
and (c) match \(\alpha = 1/137.035999\ldots\) exactly. Two cautionary notes:
classical topological invariants are discrete (integers/rationals), which makes
a transcendental-looking real unlikely from topology alone; and \(\alpha\)
runs with energy scale, so a purely topological origin is in tension with its
observed scale dependence. Treat any claimed derivation with extreme skepticism
until (a)–(c) are met. Likewise, the golden ratio appears in *specific*
self-similar systems, not in self-similarity in general; it must be derived, not
assumed.

---

## References

- M. Atiyah, "Topological Quantum Field Theories," *Publ. Math. IHÉS* 68 (1988).
- P. Deligne, "Théorie de Hodge II" (for standard Hodge-theoretic background).
- G. H. Hardy and J. E. Littlewood, "Some problems of 'Partitio Numerorum',"
  *Acta Math.* (1920s) — the circle method.
- S. Lang, *Algebraic Number Theory* (adelic background).
- Y. Manin, "Remarks on the Alexander polynomial" and arithmetic-topology
  writings.
- B. Mazur, "Arithmetic on Curves," *Bull. AMS* 14 (1986).
- L. Pontryagin, *Topological Groups* — Pontryagin duality.
- J. Tate, "Fourier Analysis in Number Fields and Hecke's Zeta-Functions"
  (Tate's thesis, 1950).
- V. S. Vladimirov, I. V. Volovich, E. I. Zelenov, *p-Adic Analysis and
  Mathematical Physics* (1994).
- CODATA, *Recommended Values of the Fundamental Physical Constants* — measured
  value and running of \(\alpha\).
- J. A. Wheeler, "Information, Physics, Quantum: The Search for Links" (1989).

*Elementary background used in Theorem 2.4 (intermediate value theorem;
connectedness; local constancy) is covered in any standard real-analysis or
point-set topology text (e.g. W. Rudin, Principles of Mathematical Analysis;
J. R. Munkres, Topology).*

*Standard results (uniqueness of the complete ordered field; prime subring;
convolution theorem) are cited as textbook material and stated without full
proof in the text.*
