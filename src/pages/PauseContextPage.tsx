import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useLiveQuery } from 'dexie-react-hooks';
import { SnapshotType, ResumeEffortEstimate, MentalState } from '../types';
import { useTranslation } from 'react-i18next';

export function PauseContextPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const task = useLiveQuery(() => db.tasks.get(id || ''));

  const [whereIStopped, setWhereIStopped] = useState('');
  const [nextExactStep, setNextExactStep] = useState('');
  const [currentBlocker, setCurrentBlocker] = useState('');
  const [rejectedOptions, setRejectedOptions] = useState('');
  const [mistakeToAvoid, setMistakeToAvoid] = useState('');
  const [noteToFutureSelf, setNoteToFutureSelf] = useState('');
  const [usefulReferences, setUsefulReferences] = useState('');
  const [resumeEffortEstimate, setResumeEffortEstimate] = useState<ResumeEffortEstimate | ''>('');
  const [mentalState, setMentalState] = useState<MentalState | ''>('');

  const [showOptional, setShowOptional] = useState(false);

  useEffect(() => {
    if (!id) navigate('/');
  }, [id, navigate]);

  if (!task) return <div className="p-4 text-center text-zinc-500">{t('common.loading')}</div>;

  const handleSave = async (type: SnapshotType = 'pause', markCompleted = false) => {
    if (!whereIStopped.trim() || !nextExactStep.trim()) return;

    const now = Date.now();
    
    await db.snapshots.add({
      id: uuidv4(),
      taskId: task.id,
      type,
      whereIStopped: whereIStopped.trim(),
      nextExactStep: nextExactStep.trim(),
      currentBlocker: currentBlocker.trim() || undefined,
      rejectedOptions: rejectedOptions.trim() || undefined,
      mistakeToAvoid: mistakeToAvoid.trim() || undefined,
      noteToFutureSelf: noteToFutureSelf.trim() || undefined,
      usefulReferences: usefulReferences.trim() || undefined,
      resumeEffortEstimate: resumeEffortEstimate || undefined,
      mentalState: mentalState || undefined,
      createdAt: now,
    });

    if (markCompleted) {
      await db.tasks.update(task.id, {
        status: 'completed',
        updatedAt: now,
        completedAt: now,
      });
    } else {
      await db.tasks.update(task.id, {
        updatedAt: now,
      });
    }

    navigate('/');
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('pause.title')}</h1>
        <p className="text-sm text-zinc-500 line-clamp-1">{task.title}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="whereIStopped" className="text-base font-semibold">{t('pause.whereStopped')}</Label>
          <Textarea 
            id="whereIStopped" 
            placeholder={t('pause.whereStoppedPlaceholder')} 
            value={whereIStopped}
            onChange={(e) => setWhereIStopped(e.target.value)}
            className="min-h-[80px] text-base"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextExactStep" className="text-base font-semibold">{t('pause.nextStep')}</Label>
          <Textarea 
            id="nextExactStep" 
            placeholder={t('pause.nextStepPlaceholder')} 
            value={nextExactStep}
            onChange={(e) => setNextExactStep(e.target.value)}
            className="min-h-[80px] text-base"
          />
        </div>

        {!showOptional ? (
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-zinc-500" 
            onClick={() => setShowOptional(true)}
          >
            {t('pause.addOptional')}
          </Button>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="currentBlocker" className="text-base font-semibold">{t('pause.blocker')}</Label>
              <Textarea 
                id="currentBlocker" 
                placeholder={t('pause.blockerPlaceholder')} 
                value={currentBlocker}
                onChange={(e) => setCurrentBlocker(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectedOptions" className="text-base font-semibold">{t('pause.rejected')}</Label>
              <Textarea 
                id="rejectedOptions" 
                placeholder={t('pause.rejectedPlaceholder')} 
                value={rejectedOptions}
                onChange={(e) => setRejectedOptions(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mistakeToAvoid" className="text-base font-semibold">{t('pause.mistake')}</Label>
              <Textarea 
                id="mistakeToAvoid" 
                placeholder={t('pause.mistakePlaceholder')} 
                value={mistakeToAvoid}
                onChange={(e) => setMistakeToAvoid(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noteToFutureSelf" className="text-base font-semibold">{t('pause.note')}</Label>
              <Textarea 
                id="noteToFutureSelf" 
                placeholder={t('pause.notePlaceholder')} 
                value={noteToFutureSelf}
                onChange={(e) => setNoteToFutureSelf(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usefulReferences" className="text-base font-semibold">{t('pause.references')}</Label>
              <Textarea 
                id="usefulReferences" 
                placeholder={t('pause.referencesPlaceholder')} 
                value={usefulReferences}
                onChange={(e) => setUsefulReferences(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-base font-semibold">{t('pause.mentalState')}</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(['clear', 'tired', 'confused', 'blocked'] as MentalState[]).map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setMentalState(state === mentalState ? '' : state)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      mentalState === state 
                        ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 border-transparent' 
                        : 'bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {state === 'clear' ? t('pause.stateClear') : state === 'tired' ? t('pause.stateTired') : state === 'confused' ? t('pause.stateConfused') : t('pause.stateBlocked')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 flex flex-col gap-3">
          <Button 
            size="lg" 
            className="w-full text-base font-semibold h-12" 
            disabled={!whereIStopped.trim() || !nextExactStep.trim()}
            onClick={() => handleSave('pause')}
          >
            {t('pause.savePauseBtn')}
          </Button>
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate(-1)}
            >
              {t('pause.cancelBtn')}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1" 
              disabled={!whereIStopped.trim() || !nextExactStep.trim()}
              onClick={() => handleSave('complete', true)}
            >
              {t('pause.saveCompleteBtn')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
