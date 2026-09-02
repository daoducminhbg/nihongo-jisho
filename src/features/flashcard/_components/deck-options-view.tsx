'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HelpCircle,
  RotateCcw,
  Save,
  Check,
  Sparkles,
  Sliders,
  Clock,
  Volume2,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import { AnkiDeckOptions, DEFAULT_ANKI_OPTIONS } from '../_types/deck-options.types';
import { loadDeckOptions, saveDeckOptions } from '../_lib/deck-options-storage';

export function DeckOptionsView() {
  const [options, setOptions] = useState<AnkiDeckOptions>(DEFAULT_ANKI_OPTIONS);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'preset' | 'this_deck' | 'today_only'>('preset');

  useEffect(() => {
    setOptions(loadDeckOptions());
  }, []);

  const handleSave = () => {
    saveDeckOptions(options);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ tùy chọn về mặc định của Anki?')) {
      setOptions(DEFAULT_ANKI_OPTIONS);
      saveDeckOptions(DEFAULT_ANKI_OPTIONS);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border shadow-xs">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Tùy chọn Bộ thẻ (Anki Deck Options)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cấu hình thuật toán, giới hạn hàng ngày, FSRS, và âm thanh theo chuẩn Anki
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1 sm:flex-initial text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Mặc định
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="flex-1 sm:flex-initial text-xs font-bold gap-1 shadow-sm"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                Đã lưu
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Lưu cấu hình
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── 1. GIỚI HẠN HÀNG NGÀY ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Giới hạn hàng ngày</CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sub-tabs header */}
          <div className="flex justify-end gap-3 text-xs border-b pb-1">
            <span
              className={`cursor-pointer pb-1 border-b-2 font-semibold ${
                activeTab === 'preset'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
              onClick={() => setActiveTab('preset')}
            >
              Preset
            </span>
            <span
              className={`cursor-pointer pb-1 border-b-2 font-semibold ${
                activeTab === 'this_deck'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
              onClick={() => setActiveTab('this_deck')}
            >
              This deck
            </span>
            <span
              className={`cursor-pointer pb-1 border-b-2 font-semibold ${
                activeTab === 'today_only'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
              onClick={() => setActiveTab('today_only')}
            >
              Today only
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="newCardsPerDay" className="text-sm">
                Thẻ mới/ngày
              </Label>
              <Input
                id="newCardsPerDay"
                type="number"
                value={options.newCardsPerDay}
                onChange={(e) =>
                  setOptions({ ...options, newCardsPerDay: parseInt(e.target.value, 10) || 0 })
                }
                className="w-28 text-right font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="maxReviewsPerDay" className="text-sm">
                Ôn tập tối đa/ngày
              </Label>
              <Input
                id="maxReviewsPerDay"
                type="number"
                value={options.maxReviewsPerDay}
                onChange={(e) =>
                  setOptions({ ...options, maxReviewsPerDay: parseInt(e.target.value, 10) || 0 })
                }
                className="w-28 text-right font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <Label htmlFor="newCardsIgnoreReviewLimit" className="text-sm cursor-pointer">
                New cards ignore review limit
              </Label>
              <Switch
                id="newCardsIgnoreReviewLimit"
                checked={options.newCardsIgnoreReviewLimit}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, newCardsIgnoreReviewLimit: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <Label htmlFor="limitsStartFromTop" className="text-sm cursor-pointer">
                Limits start from top
              </Label>
              <Switch
                id="limitsStartFromTop"
                checked={options.limitsStartFromTop}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, limitsStartFromTop: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. THẺ MỚI ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Thẻ Mới</CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="learningSteps" className="text-sm">
                Bước học
              </Label>
              <p className="text-[11px] text-muted-foreground">Ví dụ: 1m 10m (hoặc 1m 10m 1d)</p>
            </div>
            <Input
              id="learningSteps"
              value={options.learningSteps}
              onChange={(e) => setOptions({ ...options, learningSteps: e.target.value })}
              className="w-48 font-mono text-sm"
              placeholder="1m 10m"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="insertionOrder" className="text-sm">
              Lệnh chèn
            </Label>
            <Select
              value={options.insertionOrder}
              onValueChange={(val: any) => setOptions({ ...options, insertionOrder: val })}
            >
              <SelectTrigger className="w-56 text-xs">
                <SelectValue placeholder="Chọn thứ tự chèn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequential">Tuần tự (thẻ cũ nhất trước)</SelectItem>
                <SelectItem value="random">Ngẫu nhiên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. HỎNG (LAPSES) ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Hỏng</CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="relearningSteps" className="text-sm">
              Bước học lại
            </Label>
            <Input
              id="relearningSteps"
              value={options.relearningSteps}
              onChange={(e) => setOptions({ ...options, relearningSteps: e.target.value })}
              className="w-48 font-mono text-sm"
              placeholder="10m"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="leechThreshold" className="text-sm">
              Ngưỡng thành thẻ bám
            </Label>
            <Input
              id="leechThreshold"
              type="number"
              value={options.leechThreshold}
              onChange={(e) =>
                setOptions({ ...options, leechThreshold: parseInt(e.target.value, 10) || 8 })
              }
              className="w-28 text-right font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="leechAction" className="text-sm">
              Hành động với thẻ bám
            </Label>
            <Select
              value={options.leechAction}
              onValueChange={(val: any) => setOptions({ ...options, leechAction: val })}
            >
              <SelectTrigger className="w-48 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tag_only">Chỉ gắn Nhãn</SelectItem>
                <SelectItem value="suspend">Tạm hoãn Thẻ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. THỨ TỰ HIỂN THỊ ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Thứ tự hiển thị</CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-3.5">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Ưu tiên nhóm thẻ mới</Label>
            <Select
              value={options.newGatherPriority}
              onValueChange={(val: any) => setOptions({ ...options, newGatherPriority: val })}
            >
              <SelectTrigger className="w-56 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deck">Bộ thẻ</SelectItem>
                <SelectItem value="ascending_pos">Vị trí tăng dần</SelectItem>
                <SelectItem value="descending_pos">Vị trí giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Thứ tự sắp xếp thẻ mới</Label>
            <Select
              value={options.newSortOrder}
              onValueChange={(val: any) => setOptions({ ...options, newSortOrder: val })}
            >
              <SelectTrigger className="w-56 text-xs truncate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template_then_order">Theo mẫu thẻ, rồi đến thứ tự tập tin</SelectItem>
                <SelectItem value="type_order">Theo thứ tự loại thẻ</SelectItem>
                <SelectItem value="random">Ngẫu nhiên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Ưu tiên thẻ mới/ôn tập</Label>
            <Select
              value={options.newReviewPriority}
              onValueChange={(val: any) => setOptions({ ...options, newReviewPriority: val })}
            >
              <SelectTrigger className="w-56 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mix">Trộn các thẻ ôn tập</SelectItem>
                <SelectItem value="new_first">Thẻ mới trước</SelectItem>
                <SelectItem value="review_first">Thẻ ôn tập trước</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Ưu tiên học/ôn tập trong ngày</Label>
            <Select
              value={options.interdayLearningPriority}
              onValueChange={(val: any) =>
                setOptions({ ...options, interdayLearningPriority: val })
              }
            >
              <SelectTrigger className="w-56 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mix">Trộn các thẻ ôn tập</SelectItem>
                <SelectItem value="before_review">Trước khi ôn tập</SelectItem>
                <SelectItem value="after_review">Sau khi ôn tập</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Xem lại thứ tự sắp xếp</Label>
            <Select
              value={options.reviewSortOrder}
              onValueChange={(val: any) => setOptions({ ...options, reviewSortOrder: val })}
            >
              <SelectTrigger className="w-56 text-xs truncate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date_then_random">Theo ngày đến hạn, sau đó ngẫu nhiên</SelectItem>
                <SelectItem value="earliest_due">Thời gian đến hạn sớm nhất</SelectItem>
                <SelectItem value="random">Ngẫu nhiên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── 5. FSRS ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            FSRS
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
              v4.5
            </span>
          </CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <Label htmlFor="fsrsEnabled" className="text-sm font-semibold cursor-pointer">
              FSRS
            </Label>
            <Switch
              id="fsrsEnabled"
              checked={options.fsrsEnabled}
              onCheckedChange={(checked) => setOptions({ ...options, fsrsEnabled: checked })}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="desiredRetention" className="text-sm">
                Desired retention
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="desiredRetention"
                  type="number"
                  min="70"
                  max="97"
                  value={options.desiredRetention}
                  onChange={(e) =>
                    setOptions({ ...options, desiredRetention: parseInt(e.target.value, 10) || 85 })
                  }
                  className="w-20 text-right font-mono text-sm h-8"
                />
                <span className="text-sm font-bold text-muted-foreground">%</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="text-xs h-7 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
            >
              Help Me Decide (Experimental)
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">FSRS parameters</Label>
            <Textarea
              value={options.fsrsParameters}
              onChange={(e) => setOptions({ ...options, fsrsParameters: e.target.value })}
              className="font-mono text-xs h-20 resize-none leading-relaxed"
            />
            <Input
              value='preset:"Mặc định" -is:suspended'
              readOnly
              className="font-mono text-xs h-8 bg-muted/40 text-muted-foreground"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="rescheduleCardsOnChange" className="text-sm cursor-pointer">
              Reschedule cards on change
            </Label>
            <Switch
              id="rescheduleCardsOnChange"
              checked={options.rescheduleCardsOnChange}
              onCheckedChange={(checked) =>
                setOptions({ ...options, rescheduleCardsOnChange: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="checkHealthWhenOptimizing" className="text-sm cursor-pointer">
              Check health when optimizing (slow)
            </Label>
            <Switch
              id="checkHealthWhenOptimizing"
              checked={options.checkHealthWhenOptimizing}
              onCheckedChange={(checked) =>
                setOptions({ ...options, checkHealthWhenOptimizing: checked })
              }
            />
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="default" className="text-xs font-semibold">
              Optimize Current Preset
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Optimize All Presets
            </Button>
            <Button size="sm" variant="secondary" className="text-xs text-primary font-semibold">
              FSRS Simulator (Experimental)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 6. ĐANG TẠM HOÃN (BURYING) ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Đang tạm hoãn</CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <Label htmlFor="buryNewSiblings" className="text-sm cursor-pointer max-w-[80%]">
              Hoãn các thẻ anh em của thẻ mới cho tới ngày tiếp theo
            </Label>
            <Switch
              id="buryNewSiblings"
              checked={options.buryNewSiblings}
              onCheckedChange={(checked) => setOptions({ ...options, buryNewSiblings: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="buryReviewSiblings" className="text-sm cursor-pointer max-w-[80%]">
              Hoãn các thẻ anh em của thẻ ôn tập cho tới ngày tiếp theo
            </Label>
            <Switch
              id="buryReviewSiblings"
              checked={options.buryReviewSiblings}
              onCheckedChange={(checked) => setOptions({ ...options, buryReviewSiblings: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label
              htmlFor="buryInterdayLearningSiblings"
              className="text-sm cursor-pointer max-w-[80%]"
            >
              Bury interday learning siblings
            </Label>
            <Switch
              id="buryInterdayLearningSiblings"
              checked={options.buryInterdayLearningSiblings}
              onCheckedChange={(checked) =>
                setOptions({ ...options, buryInterdayLearningSiblings: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 7. ÂM THANH ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Âm thanh
          </CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <Label htmlFor="noAutoPlayAudio" className="text-sm cursor-pointer">
              Không tự động phát âm thanh
            </Label>
            <Switch
              id="noAutoPlayAudio"
              checked={options.noAutoPlayAudio}
              onCheckedChange={(checked) => setOptions({ ...options, noAutoPlayAudio: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="skipQuestionOnReplay" className="text-sm cursor-pointer">
              Bỏ qua câu hỏi khi phát lại câu trả lời
            </Label>
            <Switch
              id="skipQuestionOnReplay"
              checked={options.skipQuestionOnReplay}
              onCheckedChange={(checked) =>
                setOptions({ ...options, skipQuestionOnReplay: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 8. BỘ HẸN GIỜ ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Bộ hẹn giờ
          </CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="maxAnswerSeconds" className="text-sm">
              Số giây trả lời tối đa
            </Label>
            <Input
              id="maxAnswerSeconds"
              type="number"
              value={options.maxAnswerSeconds}
              onChange={(e) =>
                setOptions({ ...options, maxAnswerSeconds: parseInt(e.target.value, 10) || 60 })
              }
              className="w-28 text-right font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="showTimer" className="text-sm cursor-pointer">
              Hiện đồng hồ bấm giờ trả lời
            </Label>
            <Switch
              id="showTimer"
              checked={options.showTimer}
              onCheckedChange={(checked) => setOptions({ ...options, showTimer: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="stopTimerOnAnswer" className="text-sm cursor-pointer">
              Stop on-screen timer on answer
            </Label>
            <Switch
              id="stopTimerOnAnswer"
              checked={options.stopTimerOnAnswer}
              onCheckedChange={(checked) =>
                setOptions({ ...options, stopTimerOnAnswer: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 9. TỰ ĐỘNG NÂNG CAO ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Tự động Nâng cao</CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="secondsToShowQuestion" className="text-sm">
              Seconds to show question for
            </Label>
            <Input
              id="secondsToShowQuestion"
              type="number"
              step="0.5"
              value={options.secondsToShowQuestion}
              onChange={(e) =>
                setOptions({
                  ...options,
                  secondsToShowQuestion: parseFloat(e.target.value) || 0.0,
                })
              }
              className="w-28 text-right font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="secondsToShowAnswer" className="text-sm">
              Seconds to show answer for
            </Label>
            <Input
              id="secondsToShowAnswer"
              type="number"
              step="0.5"
              value={options.secondsToShowAnswer}
              onChange={(e) =>
                setOptions({ ...options, secondsToShowAnswer: parseFloat(e.target.value) || 0.0 })
              }
              className="w-28 text-right font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <Label htmlFor="waitForAudio" className="text-sm cursor-pointer">
              Chờ Âm thanh
            </Label>
            <Switch
              id="waitForAudio"
              checked={options.waitForAudio}
              onCheckedChange={(checked) => setOptions({ ...options, waitForAudio: checked })}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Question action</Label>
            <Select
              value={options.questionAction}
              onValueChange={(val: any) => setOptions({ ...options, questionAction: val })}
            >
              <SelectTrigger className="w-48 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show_answer">Show Answer</SelectItem>
                <SelectItem value="bury_card">Tạm hoãn Thẻ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Answer action</Label>
            <Select
              value={options.answerAction}
              onValueChange={(val: any) => setOptions({ ...options, answerAction: val })}
            >
              <SelectTrigger className="w-48 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bury_card">Tạm hoãn Thẻ</SelectItem>
                <SelectItem value="again">Học lại</SelectItem>
                <SelectItem value="good">Tốt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── 10. EASY DAYS ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Easy Days
          </CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 text-center text-xs text-muted-foreground pb-2 border-b">
            <span className="text-left font-semibold">Thứ</span>
            <span>Minimum</span>
            <span>Reduced</span>
            <span className="font-semibold text-primary">Normal</span>
          </div>

          {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => {
            const dayNames: Record<string, string> = {
              mon: 'Mon',
              tue: 'Tue',
              wed: 'Wed',
              thu: 'Thu',
              fri: 'Fri',
              sat: 'Sat',
              sun: 'Sun',
            };
            const currentVal = options.easyDays[day];

            return (
              <div key={day} className="grid grid-cols-4 items-center text-xs py-1">
                <span className="font-semibold text-foreground">{dayNames[day]}</span>
                <div className="flex justify-center">
                  <input
                    type="radio"
                    name={`easyDay-${day}`}
                    checked={currentVal === 'minimum'}
                    onChange={() =>
                      setOptions({
                        ...options,
                        easyDays: { ...options.easyDays, [day]: 'minimum' },
                      })
                    }
                    className="accent-primary cursor-pointer"
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="radio"
                    name={`easyDay-${day}`}
                    checked={currentVal === 'reduced'}
                    onChange={() =>
                      setOptions({
                        ...options,
                        easyDays: { ...options.easyDays, [day]: 'reduced' },
                      })
                    }
                    className="accent-primary cursor-pointer"
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="radio"
                    name={`easyDay-${day}`}
                    checked={currentVal === 'normal'}
                    onChange={() =>
                      setOptions({
                        ...options,
                        easyDays: { ...options.easyDays, [day]: 'normal' },
                      })
                    }
                    className="accent-primary cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── 11. NÂNG CAO ── */}
      <Card className="shadow-xs border border-border/70">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Nâng cao</CardTitle>
          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-70" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="maxInterval" className="text-sm">
              Khoảng tối đa (ngày)
            </Label>
            <Input
              id="maxInterval"
              type="number"
              value={options.maxInterval}
              onChange={(e) =>
                setOptions({ ...options, maxInterval: parseInt(e.target.value, 10) || 36500 })
              }
              className="w-28 text-right font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="historicalRetention" className="text-sm">
              Historical retention
            </Label>
            <div className="flex items-center gap-1.5">
              <Input
                id="historicalRetention"
                type="number"
                value={options.historicalRetention}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    historicalRetention: parseInt(e.target.value, 10) || 90,
                  })
                }
                className="w-20 text-right font-mono text-sm"
              />
              <span className="text-sm font-bold text-muted-foreground">%</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="ignoreCardsReviewedBefore" className="text-sm">
              Ignore cards reviewed before
            </Label>
            <Input
              id="ignoreCardsReviewedBefore"
              type="date"
              value={options.ignoreCardsReviewedBefore}
              onChange={(e) =>
                setOptions({ ...options, ignoreCardsReviewedBefore: e.target.value })
              }
              className="w-44 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <details className="cursor-pointer text-xs font-semibold text-primary">
              <summary className="hover:underline">▶ Tùy chỉnh lên lịch (Custom Scheduling)</summary>
              <div className="pt-2">
                <Textarea
                  value={options.customScheduling}
                  onChange={(e) => setOptions({ ...options, customScheduling: e.target.value })}
                  placeholder="// Viết mã JavaScript tùy chỉnh can thiệp vào khoảng cách ôn tập..."
                  className="font-mono text-xs h-28 resize-none mt-1"
                />
              </div>
            </details>
          </div>
        </CardContent>
      </Card>

      {/* Floating Save button */}
      <div className="sticky bottom-6 flex justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          className="shadow-xl font-bold gap-2 px-8 py-6 text-base"
        >
          {isSaved ? <Check className="w-5 h-5 text-green-400" /> : <Save className="w-5 h-5" />}
          {isSaved ? 'Đã lưu cấu hình Anki!' : 'Lưu tất cả tùy chọn'}
        </Button>
      </div>
    </div>
  );
}
