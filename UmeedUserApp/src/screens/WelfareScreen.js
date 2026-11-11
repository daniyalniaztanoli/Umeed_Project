import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { getApiErrorMessage } from '../api/apiHandler';
import { loadDraft, saveDraft, clearDraft } from '../utils/draftStorage';
import { colors } from '../theme/colors';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import ResultModal from '../components/ResultModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';


const DRAFT_KEY = 'draft_welfare_request';

const TYPES = [
  { key: 'fee', label: 'Fee Aid', emoji: '🎓' },
  { key: 'medical', label: 'Medical', emoji: '🏥' },
  { key: 'books', label: 'Books', emoji: '📚' },
  { key: 'ration', label: 'Ration', emoji: '🍚' },
  { key: 'blood', label: 'Blood', emoji: '🩸' },
  { key: 'other', label: 'Other', emoji: '✨' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const REQUEST_TYPES = [
  { key: 'need', label: 'Need Blood' },
  { key: 'donate', label: 'Donate Blood' },
];
const URGENCY = [
  { key: 'normal', label: 'Normal' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'emergency', label: 'Emergency' },
];
const GENDERS = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
];

const STATUS_STEPS = ['submitted', 'under_review', 'approved', 'disbursed'];

const FORMS = {
  fee: {
    title: 'Fee Aid Details',
    fields: [
      { key: 'fullName', label: 'Student full name *', placeholder: 'Your full name' },
      { key: 'phone', label: 'Phone number *', placeholder: '03XXXXXXXXX', keyboardType: 'phone-pad' },
      { key: 'cnic', label: 'CNIC / Student ID *', placeholder: 'CNIC or student ID' },
      { key: 'institution', label: 'Institution *', placeholder: 'University / college name' },
      { key: 'studentId', label: 'Roll / Registration no. *', placeholder: 'Registration number' },
      { key: 'program', label: 'Program / class *', placeholder: 'e.g. BSCS, Intermediate' },
      { key: 'semester', label: 'Semester / year *', placeholder: 'e.g. Fall 2026 / 2nd year' },
      { key: 'feeType', label: 'Fee type *', placeholder: 'Tuition, exam, hostel, etc.' },
      { key: 'dueDate', label: 'Fee due date *', placeholder: 'e.g. 2026-11-20' },
      { key: 'guardianName', label: 'Guardian name', placeholder: 'Parent / guardian' },
      { key: 'monthlyIncome', label: 'Monthly household income (PKR)', placeholder: 'e.g. 45000', keyboardType: 'numeric' },
      { key: 'situation', label: 'Why do you need fee aid? *', placeholder: 'Explain your financial situation', multiline: true },
    ],
  },
  medical: {
    title: 'Medical Aid Details',
    fields: [
      { key: 'patientName', label: 'Patient name *', placeholder: 'Patient full name' },
      { key: 'relation', label: 'Relation to applicant *', placeholder: 'Self, father, mother, etc.' },
      { key: 'phone', label: 'Contact number *', placeholder: '03XXXXXXXXX', keyboardType: 'phone-pad' },
      { key: 'condition', label: 'Medical condition / diagnosis *', placeholder: 'Condition or diagnosis' },
      { key: 'hospital', label: 'Hospital / clinic *', placeholder: 'Hospital name and city' },
      { key: 'doctor', label: 'Doctor name *', placeholder: 'Treating doctor' },
      { key: 'treatmentDate', label: 'Treatment / admission date *', placeholder: 'e.g. 2026-11-06' },
      { key: 'estimateBreakdown', label: 'Estimated cost breakdown *', placeholder: 'Medicine, tests, surgery, etc.', multiline: true },
      { key: 'situation', label: 'Additional details *', placeholder: 'Explain urgency and situation', multiline: true },
    ],
  },
  books: {
    title: 'Books Aid Details',
    fields: [
      { key: 'fullName', label: 'Student full name *', placeholder: 'Your full name' },
      { key: 'phone', label: 'Phone number *', placeholder: '03XXXXXXXXX', keyboardType: 'phone-pad' },
      { key: 'institution', label: 'Institution *', placeholder: 'University / college name' },
      { key: 'program', label: 'Program / class *', placeholder: 'e.g. BSCS' },
      { key: 'semester', label: 'Semester / year *', placeholder: 'e.g. 3rd semester' },
      { key: 'booksNeeded', label: 'Books / materials needed *', placeholder: 'List book names, subjects, or materials', multiline: true },
      { key: 'situation', label: 'Why do you need this support? *', placeholder: 'Explain your need', multiline: true },
    ],
  },
  ration: {
    title: 'Ration Aid Details',
    fields: [
      { key: 'fullName', label: 'Applicant full name *', placeholder: 'Your full name' },
      { key: 'phone', label: 'Phone number *', placeholder: '03XXXXXXXXX', keyboardType: 'phone-pad' },
      { key: 'cnic', label: 'CNIC *', placeholder: 'xxxxx-xxxxxxx-x' },
      { key: 'city', label: 'City *', placeholder: 'City' },
      { key: 'address', label: 'Address / delivery area *', placeholder: 'Area or address for coordination' },
      { key: 'familyMembers', label: 'Family members *', placeholder: 'e.g. 5', keyboardType: 'numeric' },
      { key: 'monthlyIncome', label: 'Monthly household income (PKR) *', placeholder: 'e.g. 35000', keyboardType: 'numeric' },
      { key: 'rationItems', label: 'Ration items needed *', placeholder: 'Flour, rice, oil, pulses, etc.', multiline: true },
      { key: 'situation', label: 'Why do you need ration support? *', placeholder: 'Explain your situation', multiline: true },
    ],
  },
  other: {
    title: 'Other Welfare Request Details',
    fields: [
      { key: 'fullName', label: 'Full name *', placeholder: 'Your full name' },
      { key: 'phone', label: 'Phone number *', placeholder: '03XXXXXXXXX', keyboardType: 'phone-pad' },
      { key: 'helpCategory', label: 'Type of help needed *', placeholder: 'Transport, emergency, shelter, etc.' },
      { key: 'situation', label: 'Describe your request *', placeholder: 'Explain what help you need and why', multiline: true },
    ],
  },
};

const emptyDetails = (t) => Object.fromEntries((FORMS[t]?.fields || []).map((f) => [f.key, '']));

export default function WelfareScreen() {
  const [type, setType] = useState('fee');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState(emptyDetails('fee'));
  const [blood, setBlood] = useState({
    requestType: 'need',
    bloodGroup: '',
    fullName: '',
    phone: '',
    cnic: '',
    age: '',
    gender: '',
    city: '',
    hospital: '',
    urgency: 'normal',
    units: '',
    neededBy: '',
    lastDonationDate: '',
    medicalConditions: '',
    contactConsent: false,
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState({ visible: false, type: 'success', title: '', message: '' });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const draftReady = useRef(false);

  const isBlood = type === 'blood';
  const setBloodField = (k) => (v) => {
    setBlood((b) => ({ ...b, [k]: v }));
    if (fieldErrors[k]) setFieldErrors((e) => ({ ...e, [k]: '' }));
  };
  const setDetail = (k) => (v) => {
    setDetails((d) => ({ ...d, [k]: v }));
    if (fieldErrors[k]) setFieldErrors((e) => ({ ...e, [k]: '' }));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const draft = await loadDraft(DRAFT_KEY);
      if (!mounted || !draft) { draftReady.current = true; return; }
      if (draft.type) setType(draft.type);
      if (draft.amount != null) setAmount(draft.amount);
      if (draft.details && typeof draft.details === 'object') setDetails({ ...emptyDetails(draft.type || 'fee'), ...draft.details });
      if (draft.blood && typeof draft.blood === 'object') setBlood((b) => ({ ...b, ...draft.blood }));
      draftReady.current = true;
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!draftReady.current) return;
    const t = setTimeout(() => { saveDraft(DRAFT_KEY, { type, amount, details, blood }); }, 400);
    return () => clearTimeout(t);
  }, [type, amount, details, blood]);

  const load = async (opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) setListLoading(true);
    setListError('');
    try {
      const { data } = await api.get('/welfare/mine');
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError(getApiErrorMessage(e));
    } finally {
      if (!silent) setListLoading(false);
    }
  };

  const changeType = (next) => {
    setType(next);
    setFieldErrors({});
    if (next !== 'blood') {
      setDetails((prev) => ({
        ...emptyDetails(next),
        fullName: typeof prev.fullName === 'string' ? prev.fullName : '',
        phone: typeof prev.phone === 'string' ? prev.phone : '',
      }));
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const validate = () => {
    const errs = {};
    if (isBlood) {
      const required = [
        ['requestType', 'Request type is required.'],
        ['bloodGroup', 'Blood group is required.'],
        ['fullName', 'Full name is required.'],
        ['phone', 'Phone number is required.'],
        ['cnic', 'CNIC / ID is required.'],
        ['age', 'Age is required.'],
        ['gender', 'Gender is required.'],
        ['city', 'City is required.'],
        ['hospital', 'Hospital / location is required.'],
        ['urgency', 'Urgency is required.'],
        ['units', 'Units required is required.'],
        ['neededBy', 'Needed by date/time is required.'],
        ['medicalConditions', 'Medical conditions / notes is required.'],
      ];
      required.forEach(([k, msg]) => { if (!String(blood[k] ?? '').trim()) errs[k] = msg; });
      if (!errs.age && (!Number.isFinite(Number(blood.age)) || Number(blood.age) < 1)) errs.age = 'Enter a valid age.';
      if (!errs.units && (!Number.isFinite(Number(blood.units)) || Number(blood.units) < 1)) errs.units = 'Enter valid units.';
      if (!blood.contactConsent) errs.contactConsent = 'Please confirm you can be contacted.';
    } else {
      const form = FORMS[type];
      (form?.fields || []).forEach((f) => { if (f.label.includes('*') && !String(details[f.key] ?? '').trim()) errs[f.key] = `${f.label.replace(' *', '')} is required.`; });
      const n = parseFloat(amount);
      if (!amount.trim()) errs.amount = 'Amount needed is required.';
      else if (!n || n <= 0) errs.amount = 'Enter a valid amount in PKR.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setConfirmVisible(true);
  };

  const submitConfirmed = async () => {
    setConfirmVisible(false);
    setLoading(true);
    try {
      if (isBlood) {
        await api.post('/welfare', {
          type: 'blood',
          bloodInfo: {
            ...blood,
            age: Number(blood.age),
            units: Number(blood.units),
            fullName: blood.fullName.trim(),
            phone: blood.phone.trim(),
            cnic: blood.cnic.trim(),
            city: blood.city.trim(),
            hospital: blood.hospital.trim(),
            neededBy: blood.neededBy.trim(),
            lastDonationDate: blood.lastDonationDate.trim(),
            medicalConditions: blood.medicalConditions.trim(),
          },
        });
      } else {
        const payloadDetails = Object.fromEntries(Object.entries(details).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
        await api.post('/welfare', {
          type,
          reason: payloadDetails.situation || FORMS[type]?.title || 'Welfare request',
          amountRequested: parseFloat(amount),
          details: payloadDetails,
        });
      }
      await clearDraft(DRAFT_KEY);
      setDetails(emptyDetails(isBlood ? 'fee' : type));
      if (isBlood) setBlood((b) => ({ ...b, requestType: 'need', bloodGroup: '', gender: '', urgency: 'normal', contactConsent: false, age: '', units: '', neededBy: '', medicalConditions: '', lastDonationDate: '' }));
      setAmount('');
      setFieldErrors({});
      await load({ silent: true });
      setResult({
        visible: true,
        type: 'success',
        title: isBlood ? 'Blood request submitted' : 'Request submitted',
        message: isBlood ? 'Your blood request has been submitted. The team will contact you after review.' : 'Your welfare request has been submitted. You will be notified when it is reviewed.',
      });
    } catch (e) {
      setResult({ visible: true, type: 'error', title: 'Submission failed', message: getApiErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  };

  const fmtAmount = (n) => `PKR ${Number(n).toLocaleString()}`;
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const stepIndex = (status) => {
    if (status === 'rejected') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load({ silent: true });
              setRefreshing(false);
            }}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>Welfare Request</Text>
      <Text style={styles.subtitle}>Need help? We're here.</Text>

      <Card style={{ marginBottom: 20 }}>
        <Text style={styles.label}>What do you need help with?</Text>
        <View style={styles.typeGrid}>
          {TYPES.map((t, i) => {
            const selected = type === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                activeOpacity={0.85}
                onPress={() => changeType(t.key)}
                style={[styles.typeItem, i % 3 !== 2 && styles.typeItemGap, selected && styles.typeItemActive]}
              >
                <View style={[styles.typeIconWrap, selected && styles.typeIconWrapActive]}>
                  <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
                </View>
                <Text style={[styles.typeLabel, selected && styles.typeLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isBlood ? (
          <View style={styles.bloodForm}>
            <Text style={styles.formSection}>Blood request details</Text>

            <ChoiceRow label="I want to *" options={REQUEST_TYPES} value={blood.requestType} onChange={setBloodField('requestType')} error={fieldErrors.requestType} />
            <ChipGrid label="Blood group *" options={BLOOD_GROUPS} value={blood.bloodGroup} onChange={setBloodField('bloodGroup')} error={fieldErrors.bloodGroup} />

            <Input label="Full name *" value={blood.fullName} onChangeText={setBloodField('fullName')} placeholder="Patient / donor name" error={fieldErrors.fullName} />
            <Input label="Phone number *" value={blood.phone} onChangeText={setBloodField('phone')} placeholder="03XXXXXXXXX" keyboardType="phone-pad" error={fieldErrors.phone} />
            <Input label="CNIC / ID *" value={blood.cnic} onChangeText={setBloodField('cnic')} placeholder="xxxxx-xxxxxxx-x" error={fieldErrors.cnic} />
            <Input label="Age *" value={blood.age} onChangeText={setBloodField('age')} placeholder="e.g. 24" keyboardType="numeric" error={fieldErrors.age} />
            <ChoiceRow label="Gender *" options={GENDERS} value={blood.gender} onChange={setBloodField('gender')} error={fieldErrors.gender} />
            <Input label="City *" value={blood.city} onChangeText={setBloodField('city')} placeholder="City" error={fieldErrors.city} />
            <Input label="Hospital / location *" value={blood.hospital} onChangeText={setBloodField('hospital')} placeholder="Hospital name and area" error={fieldErrors.hospital} />
            <ChoiceRow label="Urgency *" options={URGENCY} value={blood.urgency} onChange={setBloodField('urgency')} error={fieldErrors.urgency} />
            <Input label="Units required *" value={blood.units} onChangeText={setBloodField('units')} placeholder="e.g. 2" keyboardType="numeric" error={fieldErrors.units} />
            <Input label="Needed by (date/time) *" value={blood.neededBy} onChangeText={setBloodField('neededBy')} placeholder="e.g. 2026-11-07 10:00 AM" error={fieldErrors.neededBy} />
            <Input label="Last donation date (if donor)" value={blood.lastDonationDate} onChangeText={setBloodField('lastDonationDate')} placeholder="e.g. 2026-08-15 or N/A" />
            <Input label="Medical conditions / notes *" value={blood.medicalConditions} onChangeText={setBloodField('medicalConditions')} placeholder="Any condition, medicines, or special note" multiline error={fieldErrors.medicalConditions} />

            <TouchableOpacity style={styles.consentRow} activeOpacity={0.85} onPress={() => setBloodField('contactConsent')(!blood.contactConsent)}>
              <View style={[styles.checkbox, blood.contactConsent && styles.checkboxOn]}>{blood.contactConsent && <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text>}</View>
              <Text style={styles.consentText}>I confirm this information is correct and I can be contacted about this blood request. *</Text>
            </TouchableOpacity>
            {!!fieldErrors.contactConsent && <Text style={styles.fieldError}>{fieldErrors.contactConsent}</Text>}
          </View>
        ) : (
          <View style={styles.bloodForm}>
            <Text style={styles.formSection}>{FORMS[type]?.title || 'Request details'}</Text>
            {(FORMS[type]?.fields || []).map((f) => (
              <Input
                key={f.key}
                label={f.label}
                value={details[f.key] || ''}
                onChangeText={setDetail(f.key)}
                placeholder={f.placeholder}
                multiline={f.multiline}
                keyboardType={f.keyboardType}
                error={fieldErrors[f.key]}
              />
            ))}
            <Input
              label="Amount needed (PKR) *"
              value={amount}
              onChangeText={(v) => { setAmount(v); if (fieldErrors.amount) setFieldErrors((e) => ({ ...e, amount: '' })); }}
              placeholder="e.g. 5000"
              keyboardType="numeric"
              error={fieldErrors.amount}
            />
          </View>
        )}

        <Button
          title={isBlood ? 'Submit Blood Request' : 'Submit Request'}
          onPress={submit}
          loading={loading}
        />
      </Card>

      <Text style={styles.section}>My Requests</Text>
      {listLoading && !refreshing ? (
        <LoadingSkeleton rows={3} />
      ) : listError && requests.length === 0 ? (
        <ErrorState message={listError} onRetry={load} />
      ) : (
        <>
          {listError ? <ErrorState message={listError} onRetry={load} style={{ marginBottom: 12 }} /> : null}
          {requests.length === 0 ? (
            <EmptyState
              icon={<Text style={{ fontSize: 34 }}>❤️</Text>}
              title="No requests yet"
              message="Use the form above to ask for help. Your university welfare committee reviews every request with care."
            />
          ) : (
            requests.map((r) => {
          const t = TYPES.find((x) => x.key === r.type);
          const expanded = expandedId === r._id;
          const idx = stepIndex(r.status);
          const disb = r.disbursement;
          const b = r.bloodInfo;
          return (
            <Card key={r._id}>
              <TouchableOpacity
                onPress={() => setExpandedId(expanded ? null : r._id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ marginRight: 10 }}>
                      <Text style={{ fontSize: 22 }}>🤝</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {r.type === 'blood' && b
                          ? `Blood ${b.requestType === 'donate' ? 'Donation' : 'Needed'} · ${b.bloodGroup}`
                          : t?.label || r.type}
                      </Text>
                      <Text style={styles.cardDate}>{fmtDate(r.createdAt)}</Text>
                    </View>
                  </View>
                  <StatusBadge status={r.status} />
                </View>
                <Text style={styles.cardSub} numberOfLines={expanded ? undefined : 2}>
                  {r.reason}
                </Text>
                {r.type === 'blood' && b ? (
                  <View style={styles.bloodSummary}>
                    <Text style={styles.bloodSummaryText}>
                      {b.units} unit(s) · {b.urgency} · {b.hospital}, {b.city}
                    </Text>
                    {expanded && (
                      <View style={{ marginTop: 8 }}>
                        <DetailLine label="Contact" value={`${b.fullName} · ${b.phone}`} />
                        <DetailLine label="CNIC/ID" value={b.cnic} />
                        <DetailLine label="Age/Gender" value={`${b.age} / ${b.gender}`} />
                        <DetailLine label="Needed by" value={b.neededBy} />
                        {!!b.lastDonationDate && <DetailLine label="Last donation" value={b.lastDonationDate} />}
                        {!!b.medicalConditions && <DetailLine label="Notes" value={b.medicalConditions} />}
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.amountRow}>
                    <Text style={styles.amount}>Requested: {fmtAmount(r.amountRequested)}</Text>
                    {disb && (
                        <Text style={[styles.amount, { color: colors.careGreen }]}>
                          ✓ Paid: {fmtAmount(disb.amount)}
                      </Text>
                    )}
                  </View>
                )}
                {disb && (
                  <Text style={styles.disbMethod}>Via {disb.method} · {fmtDate(disb.createdAt)}</Text>
                )}

                {expanded && (
                  <View style={{ marginTop: 12 }}>
                    {r.status !== 'rejected' && (
                      <View style={styles.tracker}>
                        {STATUS_STEPS.map((s, i) => (
                          <View key={s} style={styles.trackerStep}>
                            <View style={[styles.dot, i <= idx && styles.dotDone]} />
                            {i < STATUS_STEPS.length - 1 && (
                              <View style={[styles.line, i < idx && styles.lineDone]} />
                            )}
                            <Text
                              style={[styles.stepLabel, i <= idx && styles.stepLabelDone]}
                              numberOfLines={1}
                            >
                              {s === 'under_review' ? 'Review' : s === 'disbursed' ? 'Paid' : s}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {r.remarks ? (
                      <View style={styles.noteBox}>
                        <Text style={styles.noteLabel}>Committee Note</Text>
                        <Text style={styles.noteText}>{r.remarks}</Text>
                      </View>
                    ) : null}
                    {r.reviewedBy?.name ? (
                      <Text style={styles.reviewedBy}>Reviewed by {r.reviewedBy.name}</Text>
                    ) : null}
                  </View>
                )}

                <Text style={styles.expandHint}>{expanded ? '▲ Hide details' : '▼ View details'}</Text>
              </TouchableOpacity>
            </Card>
          );
          })
          )}
        </>
      )}

      <ResultModal
        visible={confirmVisible}
        type="success"
        title={isBlood ? 'Submit blood request?' : 'Submit welfare request?'}
        message="Please confirm your details are correct before submitting."
        primaryLabel="Submit"
        secondaryLabel="Review"
        onPrimary={submitConfirmed}
        onSecondary={() => setConfirmVisible(false)}
        onRequestClose={() => setConfirmVisible(false)}
      />

      <ResultModal
        visible={result.visible}
        type={result.type}
        title={result.title}
        message={result.message}
        primaryLabel={result.type === 'success' ? 'Done' : 'Try again'}
        onPrimary={() => setResult((r) => ({ ...r, visible: false }))}
        onRequestClose={() => setResult((r) => ({ ...r, visible: false }))}
      />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ChoiceRow = ({ label, options, value, onChange, error }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.choiceRow}>
      {options.map((o) => {
        const active = value === o.key;
        return (
          <TouchableOpacity
            key={o.key}
            onPress={() => onChange(o.key)}
            activeOpacity={0.85}
            style={[styles.choice, active && styles.choiceActive, !!error && !active && styles.choiceError]}
          >
            <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
    {!!error && <Text style={styles.fieldError}>{error}</Text>}
  </View>
);

const ChipGrid = ({ label, options, value, onChange, error }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.chipGrid}>
      {options.map((o) => {
        const active = value === o;
        return (
          <TouchableOpacity
            key={o}
            onPress={() => onChange(o)}
            activeOpacity={0.85}
            style={[styles.chip, active && styles.chipActive, !!error && !active && styles.chipError]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
    {!!error && <Text style={styles.fieldError}>{error}</Text>}
  </View>
);

const DetailLine = ({ label, value }) => (
  <Text style={styles.detailLine}>
    <Text style={styles.detailLabel}>{label}: </Text>
    {value}
  </Text>
);

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 14, color: colors.gray, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  formSection: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 12, marginTop: 2 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  typeItem: {
    width: '31.33%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    marginBottom: 10,
  },
  typeItemGap: { marginRight: '3%' },
  typeItemActive: {
    backgroundColor: colors.careGreen,
    borderColor: colors.careGreen,
    shadowColor: colors.careGreen,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  typeIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeIconWrapActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  typeLabel: { fontSize: 12, color: colors.ink, fontWeight: '700', textAlign: 'center' },
  typeLabelActive: { color: '#fff' },
  bloodForm: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 14,
    marginTop: 2,
  },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap' },
  choice: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  choiceActive: { backgroundColor: colors.careGreen, borderColor: colors.careGreen },
  choiceText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  choiceTextActive: { color: '#fff' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    minWidth: 52,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  chipActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  chipText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  chipTextActive: { color: '#fff' },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 2, marginBottom: 6 },
  fieldError: { fontSize: 12, color: colors.red, marginTop: 4, marginBottom: 8, fontWeight: '500' },
  choiceError: { borderColor: colors.red },
  chipError: { borderColor: colors.red },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
    backgroundColor: colors.white,
  },
  checkboxOn: { backgroundColor: colors.careGreen, borderColor: colors.careGreen },
  checkboxTick: { color: '#fff', fontSize: 13, fontWeight: '800' },
  consentText: { flex: 1, fontSize: 13, color: colors.ink, lineHeight: 19 },
  section: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: { fontSize: 22, marginRight: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  cardDate: { fontSize: 12, color: colors.gray, marginTop: 2 },
  cardSub: { fontSize: 13, color: colors.gray, marginBottom: 8 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 13, fontWeight: '700', color: colors.ink },
  bloodSummary: { marginTop: 2 },
  bloodSummaryText: { fontSize: 13, fontWeight: '700', color: '#B91C1C' },
  detailLine: { fontSize: 12, color: colors.ink, marginTop: 4, lineHeight: 17 },
  detailLabel: { color: colors.gray, fontWeight: '700' },
  disbMethod: { fontSize: 12, color: colors.trustTeal, marginTop: 4 },
  tracker: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 14 },
  trackerStep: { alignItems: 'center', flex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.lightGray },
  dotDone: { backgroundColor: colors.careGreen },
  line: {
    position: 'absolute',
    top: 6,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: colors.lightGray,
    zIndex: -1,
  },
  lineDone: { backgroundColor: colors.careGreen },
  stepLabel: { fontSize: 9, color: colors.gray, marginTop: 6, textAlign: 'center' },
  stepLabelDone: { color: colors.careGreen, fontWeight: '700' },
  noteBox: { backgroundColor: colors.background, borderRadius: 10, padding: 10, marginTop: 6 },
  noteLabel: { fontSize: 11, fontWeight: '700', color: colors.trustTeal, marginBottom: 3 },
  noteText: { fontSize: 13, color: colors.ink },
  reviewedBy: { fontSize: 11, color: colors.gray, marginTop: 8, fontStyle: 'italic' },
  expandHint: {
    fontSize: 11,
    color: colors.trustTeal,
    fontWeight: '600',
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  emptyIcon: { fontSize: 32, textAlign: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  emptySub: { fontSize: 13, color: colors.gray, textAlign: 'center', marginTop: 4 },
});
