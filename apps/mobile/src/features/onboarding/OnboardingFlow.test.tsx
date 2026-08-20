import { fireEvent, render } from '@testing-library/react-native';

import { OnboardingFlow } from './OnboardingFlow';

// Note: RNTL 14's render + fireEvent are async (React 19 renderer) — await them.

describe('OnboardingFlow', () => {
  it('walks welcome → consent → journeys and returns the choices', async () => {
    const onComplete = jest.fn();
    const { getByTestId, getByText } = await render(<OnboardingFlow onComplete={onComplete} />);

    // Welcome
    await fireEvent.press(getByTestId('welcome-start'));

    // Consent — grant both
    await fireEvent.press(getByTestId('consent-capture'));
    await fireEvent.press(getByTestId('consent-analysis'));
    await fireEvent.press(getByTestId('consent-continue'));

    // Journeys — the CTA is in its "pick one" state until a track is chosen
    expect(getByText('Pick at least one')).toBeTruthy();
    await fireEvent.press(getByTestId('track-recovery'));
    expect(onComplete).not.toHaveBeenCalled();

    // Now enabled — finish
    await fireEvent.press(getByText('Start my garden'));

    expect(onComplete).toHaveBeenCalledTimes(1);
    const result = onComplete.mock.calls[0][0];
    expect(result.trackIds).toEqual(['recovery']);
    expect(result.consent).toMatchObject({ capture: true, analysis: true });
    expect(typeof result.consent.updatedAt).toBe('string');
  });

  it('supports selecting and deselecting multiple journeys', async () => {
    const onComplete = jest.fn();
    const { getByTestId, getByText } = await render(<OnboardingFlow onComplete={onComplete} />);

    await fireEvent.press(getByTestId('welcome-start'));
    await fireEvent.press(getByTestId('consent-continue')); // proceed even without consent

    await fireEvent.press(getByTestId('track-acne'));
    await fireEvent.press(getByTestId('track-hair-regrowth'));
    await fireEvent.press(getByTestId('track-acne')); // deselect acne
    await fireEvent.press(getByText('Start my garden'));

    expect(onComplete.mock.calls[0][0].trackIds).toEqual(['hair-regrowth']);
  });
});
